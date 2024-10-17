#!/usr/bin/env node
import util from "node:util";
import { exec } from "child_process";

import inquirer from "inquirer";
import fs from "fs";
import path from "path";
const execPromise = util.promisify(exec);
// 定义问题列表的类型
const questions = [
  {
    type: "input",
    name: "url",
    message: "Please enter the Git repository URL:",
    validate: (input: string) =>
      input ? true : "Git repository URL is required.",
    default: "https://github.com/ajiangpz/Visualization.git"
  },
  {
    type: "input",
    name: "author",
    message: "Please enter the author name:",
    validate: (input: string) => (input ? true : "Author name is required."),
    default: "jiangpengzhen"
  },
  {
    type: "input",
    name: "since",
    message: "Please enter the start date (YYYY-MM-DD):",
    validate: (input: string) =>
      /\d{4}-\d{2}-\d{2}/.test(input)
        ? true
        : "Please enter a valid date (YYYY-MM-DD).",
    default: "2024-09-01"
  },
  {
    type: "input",
    name: "until",
    message: "Please enter the end date (YYYY-MM-DD):",
    validate: (input: string) =>
      /\d{4}-\d{2}-\d{2}/.test(input)
        ? true
        : "Please enter a valid date (YYYY-MM-DD).",
    default: "2024-09-30"
  }
];

// 开始提问并执行 git 命令
inquirer
  .prompt(questions as any)
  .then(answers => {
    const { url, branch, author, since, until } = answers;
    const repoDir = path.join(process.cwd(), "temp-repo"); // 临时存放仓库的目录

    // 检查仓库是否已经存在
    if (fs.existsSync(repoDir)) {
      console.log("Repository already exists. Fetching latest changes...");

      // 如果仓库已存在，则执行更新操作
      exec(`git fetch origin ${branch}`, { cwd: repoDir }, fetchError => {
        if (fetchError) {
          console.error(`Error fetching latest changes: ${fetchError}`);
          process.exit(1);
        }
        
        analyzeLog();
      });
    } else {
      console.log("Cloning repository...");

      // 克隆仓库
      const cloneCommand = `git clone -b ${branch} ${url} ${repoDir}`;

      exec(cloneCommand, cloneError => {
        if (cloneError) {
          console.error(`Error cloning repository: ${cloneError}`);
          process.exit(1);
        }
        analyzeLog();
      });
    }

    // 分析 git 日志
    function analyzeLog() {
      const logCommand = `git log --author="${author}" --since=${since} --until=${until} --pretty=tformat: --numstat`;

      console.log("Analyzing log...");

      exec(logCommand, { cwd: repoDir }, (logError, stdout) => {
        if (logError) {
          console.error(`Error retrieving git log: ${logError}`);
          process.exit(1);
        }

        let addedLines = 0;
        let removedLines = 0;

        stdout.split("\n").forEach(line => {
          const [added, removed] = line.split("\t");
          if (added && removed) {
            addedLines += parseInt(added, 10);
            removedLines += parseInt(removed, 10);
          }
        });

        const totalLines = addedLines - removedLines;

        console.log(
          `\nResults for author "${author}" from ${since} to ${until}:`
        );
        console.log(`Added lines: ${addedLines}`);
        console.log(`Removed lines: ${removedLines}`);
        console.log(`Total lines (added - removed): ${totalLines}`);

        // 清理临时目录
        // exec(`rm -rf ${repoDir}`);
      });
    }
  })
  .catch(error => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });

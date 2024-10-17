#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const inquirer_1 = __importDefault(require("inquirer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// 定义问题列表的类型
const questions = [
    {
        type: 'input',
        name: 'url',
        message: 'Please enter the Git repository URL:',
        validate: (input) => input ? true : 'Git repository URL is required.'
    },
    {
        type: 'input',
        name: 'branch',
        message: 'Please enter the branch to clone (leave blank for default branch):',
        default: 'main' // 可以设置默认分支名称
    },
    {
        type: 'input',
        name: 'author',
        message: 'Please enter the author name:',
        validate: (input) => input ? true : 'Author name is required.',
        default: "jiangpengzhen"
    },
    {
        type: 'input',
        name: 'since',
        message: 'Please enter the start date (YYYY-MM-DD):',
        validate: (input) => /\d{4}-\d{2}-\d{2}/.test(input) ? true : 'Please enter a valid date (YYYY-MM-DD).',
        default: "2024-09-01"
    },
    {
        type: 'input',
        name: 'until',
        message: 'Please enter the end date (YYYY-MM-DD):',
        validate: (input) => /\d{4}-\d{2}-\d{2}/.test(input) ? true : 'Please enter a valid date (YYYY-MM-DD).',
        default: "2024-09-30"
    }
];
// 开始提问并执行 git 命令
inquirer_1.default.prompt(questions).then(answers => {
    const { url, branch, author, since, until } = answers;
    const repoDir = path_1.default.join(process.cwd(), 'temp-repo'); // 临时存放仓库的目录
    // 检查仓库是否已经存在
    if (fs_1.default.existsSync(repoDir)) {
        console.log('Repository already exists. Fetching latest changes...');
        // 如果仓库已存在，则执行更新操作
        (0, child_process_1.exec)(`git fetch origin ${branch}`, { cwd: repoDir }, (fetchError) => {
            if (fetchError) {
                console.error(`Error fetching latest changes: ${fetchError}`);
                process.exit(1);
            }
            analyzeLog();
        });
    }
    else {
        console.log('Cloning repository...');
        // 克隆仓库
        const cloneCommand = `git clone -b ${branch} ${url} ${repoDir}`;
        (0, child_process_1.exec)(cloneCommand, (cloneError) => {
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
        console.log('Analyzing log...');
        (0, child_process_1.exec)(logCommand, { cwd: repoDir }, (logError, stdout) => {
            if (logError) {
                console.error(`Error retrieving git log: ${logError}`);
                process.exit(1);
            }
            let addedLines = 0;
            let removedLines = 0;
            stdout.split('\n').forEach(line => {
                const [added, removed] = line.split('\t');
                if (added && removed) {
                    addedLines += parseInt(added, 10);
                    removedLines += parseInt(removed, 10);
                }
            });
            const totalLines = addedLines - removedLines;
            console.log(`\nResults for author "${author}" from ${since} to ${until}:`);
            console.log(`Added lines: ${addedLines}`);
            console.log(`Removed lines: ${removedLines}`);
            console.log(`Total lines (added - removed): ${totalLines}`);
            // 清理临时目录
            // exec(`rm -rf ${repoDir}`);
        });
    }
}).catch(error => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
});

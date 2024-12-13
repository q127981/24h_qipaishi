#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var colors_1 = tslib_1.__importDefault(require("colors"));
console.log([
    '',
    'Usage:',
    '',
    '    ' + colors_1.default.green.bold('npx iconfont-init [--output]') + '     : Generate configuration file, default file name is iconfont.json',
    '    ' + colors_1.default.green.bold('npx iconfont-wechat [--config]') + '   : Generate wechat icon component',
    '    ' + colors_1.default.green.bold('npx iconfont-alipay [--config]') + '   : Generate alipay icon component',
    '    ' + colors_1.default.green.bold('npx iconfont-baidu [--config]') + '    : Generate baidu icon component',
    '    ' + colors_1.default.green.bold('npx iconfont-toutiao [--config]') + '  : Generate toutiao icon component',
    '    ' + colors_1.default.green.bold('npx iconfont-kuaishou [--config]') + '  : Generate kuaishou icon component',
    '    ' + colors_1.default.green.bold('npx iconfont-qq [--config]') + '       : Generate qq icon component',
    '',
].join('\n'));

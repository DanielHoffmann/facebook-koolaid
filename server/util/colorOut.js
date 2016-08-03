var clc = require('cli-color');
module.exports = () => {
   return({
      format : [
         clc.black.bgWhite("{{timestamp}} {{file}}:{{line}} ") + "<{{title}}> {{method}} {{message}}" //default format
      ],
      filters : {
         //log : clc.black.bgWhite,
         trace : clc.magenta,
         debug : clc.cyan,
         info : clc.green,
         warn : clc.xterm(220).bgXterm(236),
         error : clc.red.bold,
         high : clc.xterm(123).bgXterm(200)
      }
   });
};

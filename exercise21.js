function recurse() { process.nextTick(recurse); }
recurse();                     // I/O callbacks and timers NEVER run
setTimeout(() => console.log('never printed'), 0);
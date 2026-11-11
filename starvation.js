let count = 0;

function repeat() {

    count++;

    if (count % 100000 === 0) {
        console.log("Executed:", count);
    }

    process.nextTick(repeat);
}

repeat();

setTimeout(() => {
    console.log("Timer executed");
}, 1000);
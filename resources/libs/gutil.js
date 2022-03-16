/*
? @document-start
=========================
| GENERIC API UTILITIES |
==================================================================================================================================

? @author:                 William J. Horn
? @document-name:          gutil.js
? @document-created:       03/04/2022
? @document-modified:      03/07/2022
? @document-version:       v1.0.0

==================================================================================================================================

? @document-info
==================
| ABOUT DOCUMENT |
==================================================================================================================================

This library was designed specifically for the Code Quiz program

==================================================================================================================================

? @document-api
=============
| ABOUT API |
==================================================================================================================================

|
* gutil.randomInt ([int] min, *[int] max) {
    Purpose:    Return a random integer from 'min' to 'max'. If no max is given then max becomes the min and min is set to zero
                resulting in a random number from 0 to the original value of min.

    Params:     [int] "min"
                    Any integer
                *[int] "max" 
                    Any integer

    Returns     [int] A random integer.

    Example:

    console.log(gutil.randomInt(1,5)) --> 3 (random 1 to 5)
    console.log(gutil.randomInt(5)) --> 1 (random 0 to 5)

==================================================================================================================================

? @document-todo
=================
| DOCUMENT TODO |
==================================================================================================================================

-   

==================================================================================================================================
*/

const gutil = {}
const debounceGates = {}
let debugMode = false;

gutil.enableDebugMode = function() {
    debugMode = true;
}

gutil.disableDebugMode = function() {
    debugMode = false;
}

gutil.debugPrint = function(...args) {
    if (debugMode) {
        console.log("[debug]", ...args);
    }
}

gutil.giveDebounce = function(f, delay) {
    const prevRef = debounceGates[f];
    if (prevRef && !prevRef.debounceGate) {
        this.debugPrint("function is debounced"); 
        return () => {}; // return empty function to prevent error calling a debounced function
    }

    const debRef = {debounceGate: true}
    debounceGates[f] = debRef;

    return function(...args) {
        if (debRef.debounceGate) {
            debRef.debounceGate = false;
            debRef.func = f;
            debRef.func(...args);
            if (delay) {
                debRef.timeout = setTimeout(() => {
                    debRef.debounceGate = true;
                }, delay*1000);
            }
        }
    }
}

gutil.cancelDebounce = function(f) {
    const ref = debounceGates[f];
    if (ref.timeout) clearTimeout(ref.timeout);
    ref.debounceGate = true;
}

gutil.getDebounce = function(f) {
    return debounceGates[f];
}

// fixed bug
// randomInt will now return values from 0-max
gutil.randomInt = function(min, max) {
    if (!max) { max = min; min = 0; }
    let rand = Math.random();
    return min + Math.floor((max - min)*rand + 0.5);
}

gutil.randomizeArray = function(array) {
    for (let i = 0; i < array.length; i++) {
        let randIndex = this.randomInt(i, array.length - 1);
        [array[i], array[randIndex]] = [array[randIndex], array[i]];
    }
    return array;
}

gutil.weakCloneArray = function(array) {
    let newArray = [];
    for (let i = 0; i < array.length; i++) {
        newArray[i] = array[i];
    }
    return newArray;
}

gutil.getRandomIndex = function(array) {
    return array[randomInt(array.length - 1)];
}

export default gutil;
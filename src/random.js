"use strict";

const multiplier = 0x5DEECE66Dn
const addend = 0xBn
const mask = (1n << 48n) - 1n

function initialScramble(seed) {
    return (seed ^ multiplier) & mask; //always positive, actually saved
}

class JavaRandom {
    seed

    constructor(seed) {
        this.seed = initialScramble(seed)
    }

    next(bits) { //: BigInt, bits: BigInt
        const nextseed = (this.seed * multiplier + addend) & mask;
        this.seed = nextseed
        //now 48 bits
        //return highest order n bits
        return (nextseed >> (48n - bits));
    }

    nextInt(bound) { //bound: BigInt
        if (bound <= 0n) throw new SyntaxError("invalid bound")
        //bound: up to 2^31-1
        
        let r = this.next(31n); //random number 0 to 2^31-1
        let m = bound - 1n;
        if ((bound & m) == 0n)  // i.e., bound is a power of 2
            r = ((bound * r) >> 31n); // return (r << log(bound)) >> 31, or highest order log(bound) bits of r
        else {
            for (let u = r;
                u - (r = u % bound) + m < 0;
                u = this.next(31n));
        }
        return r
    }

    nextFloat() {//: Number
        return Number(this.next(24n)) / (1 << 24)
    }
}

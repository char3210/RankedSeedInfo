



class RNGState {
    static Type = {
        'BLAZE': 0,
        'BLAZE_SPAWN': 1,
        'BARTER': 2,
        'ENDERMAN': 3,
        'FLINT': 4,
        'EYE': 5,
        'SUS_STEW': 6,
        'HOGLIN': 7,
        'FOOD_RANDOM': 8,
        'TRADE': 9,
        'DRAGON_PERCH': 10,
        'DRAGON_PATH': 11,
        'DRAGON_HEIGHT': 12,
        'CHICKEN': 13,
        'SHEEP': 14,
        'COW': 15,
        'PIG': 16,
        'ENDER_MITE': 17,
        'RAIN_WITH_THUNDER': 18,
        'SPAWN': 19,
        'PHANTOM': 20,
        'DEAD_BUSH': 21
    }

    randoms

    constructor(seed) {
        seed += 4262064045n;

        this.randoms = []
        for (let type in RNGState.Type) {
            let random = new JavaRandom(0n)
            random.seed = initialScramble(seed + BigInt(RNGState.Type[type]))
            this.randoms.push(random)
        }
    }

    // state.getRandom(RNGState.Type.CHICKEN)
    getRandom(type) {
        return this.randoms[type]
    }
}

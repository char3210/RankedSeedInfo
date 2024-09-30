



class RNGState {
    static Types = [
        "BLAZE",
        "BLAZE_SPAWN",
        "MAGMA_CUBE_SPAWN",
        "BARTER",
        "ENDERMAN",
        "FLINT",
        "EYE",
        "SUS_STEW",
        "HOGLIN",
        "FOOD_RANDOM",
        "TRADE",
        "DRAGON_STANDARD",
        "DRAGON_PERCH",
        "DRAGON_PATH",
        "DRAGON_HEIGHT",
        "CHICKEN",
        "SHEEP",
        "SHEEP_SHEARS",
        "COW",
        "PIG",
        "ENDER_MITE",
        "RAIN_WITH_THUNDER",
        "SPAWN",
        "PHANTOM",
        "LEAVES",
        "DEAD_BUSH",
        "FORTRESS_SPAWN"];

    static Type = {};
    static {
        let i = 0
        for (let type of RNGState.Types) {
            RNGState.Type[type] = i
            i++
        }
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

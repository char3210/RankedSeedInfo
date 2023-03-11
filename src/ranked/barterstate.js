

class PiglinBarterState {
    static MAX_GUARANTEE = 72;
    static MAX_PEARL_COUNT = 3;
    static MAX_OBSIDIAN_COUNT = 6;
    currentGuarantee = 0;
    obsidianCount = PiglinBarterState.MAX_OBSIDIAN_COUNT;
    pearlCount = PiglinBarterState.MAX_PEARL_COUNT;
    pearl = 0;
    obsidian = 0;
    preventIncrease = false;

    guaranteeItem(itemStack, random) {
        let newItem = this.guaranteeItem2(itemStack, random)
        if (!this.preventIncrease) {
            this.currentGuarantee++
        }
        return newItem
    }

    guaranteeItem2(itemStack, random) {
        if (this.currentGuarantee == PiglinBarterState.MAX_GUARANTEE) {
            this.currentGuarantee = 0;
            this.pearl = 0;
            this.obsidian = 0;
            this.pearlCount = PiglinBarterState.MAX_PEARL_COUNT;
            this.obsidianCount = PiglinBarterState.MAX_OBSIDIAN_COUNT;
        }
        if (this.pearl == 0 && this.pearlCount > 0) {
            this.rollPearlIndex(random);
        }
        if (this.obsidian == 0 && this.obsidianCount > 0) {
            this.rollObsidianIndex(random);
        }
        if (itemStack.item == 'minecraft:ender_pearl') {
            if (this.pearlCount < 0) {
                this.preventIncrease = true;
                let newBarterItem = this.getBarteredItem(random);
                this.preventIncrease = false;
                return newBarterItem;
            }
            this.rollPearlIndex(random);
            return itemStack;
        }
        if (itemStack.item == 'minecraft:obsidian') {
            this.rollObsidianIndex(random);
            return itemStack;
        }
        if (this.pearl <= this.currentGuarantee && this.pearlCount >= 0) {
            this.rollPearlIndex(random);
            return {'item': 'minecraft:ender_pearl', 'amount': random.nextInt(5n) + 4n};
        }
        if (this.obsidian <= this.currentGuarantee && this.obsidianCount >= 0) {
            this.rollObsidianIndex(random);
            return {'item': 'minecraft:obsidian', 'amount': 1};
        }
        return itemStack;
    }

    rollPearlIndex(random) {
        this.pearl = random.nextInt(BigInt(Math.max(1, PiglinBarterState.MAX_GUARANTEE - this.currentGuarantee - this.pearlCount))) + BigInt(this.currentGuarantee);
        --this.pearlCount;
    }

    rollObsidianIndex(random) {
        this.obsidian = random.nextInt(BigInt(Math.max(1, PiglinBarterState.MAX_GUARANTEE - this.currentGuarantee - this.obsidianCount))) + BigInt(this.currentGuarantee);
        --this.obsidianCount;
    }

    //injected version of getBarteredItem  
    getBarteredItem(random) {
        const res = {}
        let j = random.nextInt(423n)
        for (let entry of entries) {
            if ((j -= entry['weight']) >= 0) continue;
            let amount = getAmount(entry, random)
            return this.modifyPiglinRandom({'item': entry.name, 'amount': amount}, random)
        }
        return res
    }

    modifyPiglinRandom(itemStack, random) {
        return this.guaranteeItem(itemStack, random)
    }
}
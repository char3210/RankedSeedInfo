

class PiglinBarterState {
    static MAX_GUARANTEE = 72;
    static MAX_PEARL_COUNT = 3;
    static MAX_OBSIDIAN_COUNT = 6;
    pearlTradeIndexes = []
    obsidianTradeIndexes = []
    currentTrades = 2147483647
    rolling = false

    refreshTradeIndexes(random) {
        this.currentTrades = 0

        let numbers = [...Array(PiglinBarterState.MAX_GUARANTEE).keys()]
        this.shuffle(numbers, random)
        console.log(numbers.slice())

        this.pearlTradeIndexes.push(...numbers.splice(0, PiglinBarterState.MAX_PEARL_COUNT))
        this.obsidianTradeIndexes.push(...numbers.splice(0, PiglinBarterState.MAX_OBSIDIAN_COUNT))
    }
    
    shuffle(list, random) {
        for (let i = list.length; i > 1; i--) {
            this.swap(list, i-1, Number(random.nextInt(BigInt(i))))
        }
    }

    swap(l, i, j) {
        let tmp = l[j]
        l[j] = l[i]
        l[i] = tmp
    }

    guaranteeItem(itemStack, random) {
        let newItem = this.guaranteeItem2(itemStack, random)
        if (!this.rolling) {
            this.currentTrades++
        }
        return newItem
    }

    guaranteeItem2(itemStack, random) {
        if (this.currentTrades >= PiglinBarterState.MAX_GUARANTEE) {
            this.refreshTradeIndexes(random);
        }
        if (itemStack.item == 'minecraft:ender_pearl') {
            if (this.pearlTradeIndexes.length == 0) {
                this.rolling = true
                let newBarterItem = this.getBarteredItem(random)
                this.rolling = false
                return newBarterItem
            }
            this.pearlTradeIndexes.shift() // removes first element
            return itemStack
        }

        if (itemStack.item == 'minecraft:obsidian') {
            if (this.obsidianTradeIndexes.length != 0) {
                this.obsidianTradeIndexes.shift()
            }
            return itemStack
        }

        let pearlIndex = this.pearlTradeIndexes.indexOf(this.currentTrades)
        if (pearlIndex != -1) {
            if (!this.rolling) {
                this.pearlTradeIndexes.splice(pearlIndex, 1)
            }
            return {'item': 'minecraft:ender_pearl', 'amount': Number(random.nextInt(5n)) + 4}
        }

        let obbyIndex = this.obsidianTradeIndexes.indexOf(this.currentTrades)
        if (obbyIndex != -1) {
            if (!this.rolling) {
                this.obsidianTradeIndexes.splice(obbyIndex, 1)
            }
            return {'item': 'minecraft:obsidian', 'amount': 1}
        }

        return itemStack
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
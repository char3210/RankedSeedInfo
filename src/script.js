"use strict";

const DEFAULT_SEED = '-1747862978341114290'
const WHITELISTED_ITEMS = [
    'minecraft:obsidian', 
    'minecraft:ender_pearl', 
    'minecraft:string', 
    'minecraft:glowstone_dust', 
    'minecraft:crying_obsidian', 
    'minecraft:potion',
    'minecraft:splash_potion'
]

const seedinput = document.getElementById("seed")

const goldinput = document.getElementById("goldinput")
const goldslider = document.getElementById("goldslider")
const filter = document.getElementById("filter")
const bartersout = document.getElementById("items")

const blazeinput = document.getElementById("blazeinput")
const blazeslider = document.getElementById("blazeslider")
const fivelabel = document.getElementById("5rodskilled")
const sixlabel = document.getElementById("6rodskilled")
const sevenlabel = document.getElementById("7rodskilled")
const blazeout = document.getElementById("rods")
const blazelist = document.getElementById("blazelist")

const flint = document.getElementById("flint")
const flintlist = document.getElementById("flintlist")

let entries

let currseed = BigInt(DEFAULT_SEED)
let gold = 1
let blazes = 1

seedinput.addEventListener('input', () => {
    const tempseed = parseLong(seedinput.value)
    if (tempseed == null) {
        return
    }

    currseed = tempseed
    refreshSeed()
})

goldinput.addEventListener('input', () => {
    const tempgold = parseInt(goldinput.value)
    if (isNaN(tempgold) || tempgold > 500 || tempgold < 0) {
        return
    }

    gold = tempgold
    goldslider.value = Math.min(Math.max(gold, goldslider.min), goldslider.max);
    refreshGold()
})

goldslider.addEventListener('input', () => {
    const tempgold = parseInt(goldslider.value)
    if (isNaN(tempgold) || tempgold > 500 || tempgold < 0) {
        return
    }

    gold = tempgold
    goldinput.value = goldslider.value
    refreshGold()
})

for (let d of ['-9', '-1', '+1', '+9']) {
    document.getElementById("gold"+d).addEventListener('click', () => {
        gold += parseInt(d)
        if (gold < 0) gold = 0
        if (gold > 500) gold = 500
        goldslider.value = Math.min(Math.max(gold, goldslider.min), goldslider.max);
        goldinput.value = gold
        refreshGold()
    })
}

for (let blocks of [4, 6, 8, 10]) {
    document.getElementById("gold"+blocks+"b").addEventListener('click', () => {
        gold = blocks * 9
        goldslider.value = Math.min(Math.max(gold, goldslider.min), goldslider.max);
        goldinput.value = gold
        refreshGold()
    })
}

filter.addEventListener('input', () => {
    refreshGold()
})

blazeinput.addEventListener('input', () => {
    const tempblaze = parseInt(blazeinput.value)
    if (isNaN(tempblaze) || tempblaze > 500 || tempblaze < 0) {
        return
    }

    blazes = tempblaze
    blazeslider.value = Math.min(Math.max(blazes, blazeslider.min), blazeslider.max)
    refreshBlaze()
})

blazeslider.addEventListener('input', () => {
    const tempblaze = parseInt(blazeslider.value)
    if (isNaN(tempblaze) || tempblaze > 500 || tempblaze < 0) {
        return
    }

    blazes = tempblaze
    blazeinput.value = blazes
    refreshBlaze()
})

document.getElementById('5rodsbutton').addEventListener('click', () => {
    blazes = parseInt(fivelabel.innerText.split(" ")[0]) //todo make less jank
    blazeslider.value = Math.min(Math.max(blazes, blazeslider.min), blazeslider.max)
    blazeinput.value = blazes
    refreshBlaze()
})

document.getElementById('6rodsbutton').addEventListener('click', () => {
    blazes = parseInt(sixlabel.innerText.split(" ")[0]) 
    blazeslider.value = Math.min(Math.max(blazes, blazeslider.min), blazeslider.max)
    blazeinput.value = blazes
    refreshBlaze()
})

document.getElementById('7rodsbutton').addEventListener('click', () => {
    blazes = parseInt(sevenlabel.innerText.split(" ")[0]) 
    blazeslider.value = Math.min(Math.max(blazes, blazeslider.min), blazeslider.max)
    blazeinput.value = blazes
    refreshBlaze()
})

async function load() {
    clearInputs()
    await fetchBarterTable()
    refreshSeed()
}

function clearInputs() {
    seedinput.value = DEFAULT_SEED
    goldinput.value = '1'
    goldslider.value = '1'
    blazeinput.value = '1'
    blazeslider.value = '1'
}

async function fetchBarterTable() {
    const response = await fetch('piglin_bartering.json')
    const bartering_table = await response.json()
    entries = bartering_table["pools"][0]["entries"]
    for (let entry of entries) {
        entry["weight"] = BigInt(entry["weight"])
    }
}

function refreshSeed() {
    refreshGold()
    refreshNBlazes()
    refreshBlaze()
    refreshGravel()
}

function refreshGold() { 
    const rngState = new RNGState(currseed)
    const barterstate = new PiglinBarterState()
    const res = {}

    for (let i=0; i < gold; i++) {
        const nextBarter = barterstate.getBarteredItem(rngState.getRandom(RNGState.Type.BARTER))
        add(res, nextBarter.item, nextBarter.amount)
    }

    bartersout.innerHTML = ''
    for (let item in res) {
        if (filter.checked && !WHITELISTED_ITEMS.includes(item)) continue
        const row = document.createElement('tr')
        const itemdisp = document.createElement('td')
        const amountdisp = document.createElement('td')
        itemdisp.innerText = item
        amountdisp.innerText = res[item]
        row.appendChild(itemdisp)
        row.appendChild(amountdisp)
        bartersout.appendChild(row)
    }
}

function getAmount(entry, random) {
    let amount = 1
    const functions = entry.functions
    if (functions != null) {
        for (let f of functions) {
            if (f.function == "minecraft:set_count") {
                amount = helperNextInt(random, BigInt(f.count.min), BigInt(f.count.max)) //UniformLootTableRange.java:50
            } else if(f.function == "minecraft:enchant_randomly") {
                random.nextInt(1n) //EnchantRandomlyLootFunction.java:68
                helperNextInt(random, 1n, 3n) //EnchantRandomlyLootFunction.java:74 soul speed is 1 to 3
            }
        }
    }
    return amount
}

function refreshBlaze() {
    const rngstate = new RNGState(currseed)
    const res = {}

    blazelist.replaceChildren()
    blazelist.appendChild(createIcon('img/iron_sword.png'))
    for (let i=0; i < blazes; i++) {
        const nextBlazeDrop = getNextBlazeDrop(rngstate.getRandom(RNGState.Type.BLAZE), i)
        if (nextBlazeDrop.amount) {
            blazelist.appendChild(createIcon('img/blazewithrod.png', 'drop'))
        } else {
            blazelist.appendChild(createIcon('img/blaze.png', 'no drop'))
        }
        add(res, nextBlazeDrop.item, nextBlazeDrop.amount)
    }

    blazeout.innerHTML = ''
    for (let item in res) {
        const row = document.createElement('tr')
        const itemdisp = document.createElement('td')
        const amountdisp = document.createElement('td')
        itemdisp.innerText = item
        amountdisp.innerText = res[item]
        row.appendChild(itemdisp)
        row.appendChild(amountdisp)
        blazeout.appendChild(row)
    }
}

function refreshNBlazes() {
    const rngstate = new RNGState(currseed)

    fivelabel.innerText = ""
    sixlabel.innerText = ""
    sevenlabel.innerText = ""

    let rods = 0n
    for (let i=1; i < 1000; i++) {
        const nextBlazeDrop = getNextBlazeDrop(rngstate.getRandom(RNGState.Type.BLAZE), i)
        rods += nextBlazeDrop.amount
        if (rods >= 5 && fivelabel.innerText == "") {
            fivelabel.innerText = i + " blazes killed"
        }
        if (rods >= 6 && sixlabel.innerText == "") {
            sixlabel.innerText = i + " blazes killed"
        }
        if (rods >= 7 && sevenlabel.innerText == "") {
            sevenlabel.innerText = i + " blazes killed"
            return;
        }
    }
}

function getNextBlazeDrop(random, blaze) {
    //assume no looting
    //one function: set count 0 to 1
    if (blaze > 20) return {'item': 'minecraft:blaze_rod', 'amount': 1n};

    let amount = helperNextInt(random, 0n, 1n)
    return {'item': 'minecraft:blaze_rod', 'amount': amount}
}

function refreshGravel() {
    const rngstate = new RNGState(currseed)
    const gravelrandom = rngstate.getRandom(RNGState.Type.FLINT)
    let count = 0
    do {
        count++
    } while (!(gravelrandom.nextFloat() < 0.1))
    flint.textContent = 'mine '+count+' gravel for flint'

    flintlist.replaceChildren()
    flintlist.appendChild(createIcon('img/iron_shovel.png'))
    for (let i = 0; i < count - 1; i++) {
        flintlist.appendChild(createIcon('img/gravel.png', 'gravel'))
    }
    flintlist.appendChild(createIcon('img/flint.png', 'flint'))
}

function createIcon(name, alt) {
    const res = document.createElement('img')
    res.classList.add('icon')
    res.src = name
    if (alt != null) {
        res.alt = alt
    }
    return res
}

function add(object, key, value) {
    if (key in object) {
        object[key] += value
    } else {
        object[key] = value
    }
}

function helperNextInt(random, min, max) {
    if (min >= max) {
        return min
    }
    return random.nextInt(max - min + 1n) + min
}

function parseLong(str) {
    if (str.length > 22) {
        return null
    }
    let res
    try {
        res = BigInt(str)
    } catch (ignored) {
        return null
    }
    if (res > (2n**63n - 1n) || res < (2n**63n * -1n)) {
        return null
    }
    return res
}

load()

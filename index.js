"use strict"

const qs = require("qs")
const fs = require("fs")
const gm = require("gm").subClass({ imageMagick: true })
const path = require("path")
const crypto = require("crypto")
const request = require("request")
//const express = require("express")
//const app = express()

var data = {
    la: 26.9,
    lo: 130.3,
    a: false,
    e: "Amami Oshima Waters",
    m: 3.5,
    s: "1",
    d: 10
}

var url = `https://maps.googleapis.com/maps/api/staticmap?${qs.stringify({
    zoom: 6,
    size: "386x159",
    center: `${data.la},${data.lo}`,
    markers: `${data.la},${data.lo}`,
    style: "feature:road|visibility:off",
    format: "png"
})}`

// main function
function init() {
    // map
    var map_name = `${data.la}_${data.lo}`
    var map_dir = path.join(__dirname, "maps", map_name + ".png")

    // output
    var out_id = crypto.createHash("md5").update(JSON.stringify(data)).digest("hex")
    var out_dir = path.join(__dirname, "out", out_id + ".png")

    // check if map already exists
    fs.access(map_dir, fs.F_OK, (err) => {
        // map exists
        if (!err) {
            console.log("map exists")
        }

        // map doesn't exist
        else if (err) {
            console.log("map doesn't exist")

            // get map
            request.get({ url: url, encoding: "binary" }, function(err, res, body) {
                // save map
                fs.writeFile(map_dir, body, "binary", (err) => {
                    if (err) throw err
                })
            })
        }
    })

    // check if image already exists
    fs.access(out_dir, fs.F_OK, (err) => {
        // output exists
        if (!err) {
            console.log("image exists")
            // serve existing image
        }

        // output doesn't exist
        else if (err) {
            console.log("image doesn't exist")

            // make image
            make(map_name, out_dir, data)
        }
    })
}

// generate image
function make(map_name, out_dir, data) {
    gm("base/card.png")
        .draw([`image Over 7,6 0,0 maps/${map_name}.png`])
        .draw(["image Over 20,180 0,0 base/silent.png"])
        .font("base/font.ttf", 18).drawText(70, 193, data.e)
        .font("base/font.ttf", 16).drawText(70, 216, `Magnitude ${data.m}, Seismic ${data.s}, Depth ${data.d}km`)
        .write(out_dir, (err) => { if (err) console.error(err) })
}

// start program
init()

/*
app.listen(3000, () => {
    console.log("Express Server, Started")
})
*/

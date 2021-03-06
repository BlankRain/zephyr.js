// Copyright (c) 2016, Intel Corporation.

// Testing GPIO APIs

// Pre-conditions
console.log("Wire IO2 to IO4");

var total = 0;
var passed = 0;

function assert(actual, description) {
    total += 1;

    var label = "\033[1m\033[31mFAIL\033[0m";
    if (actual === true) {
        passed += 1;
        label = "\033[1m\033[32mPASS\033[0m";
    }

    console.log(label + " - " + description);
}

function expectThrow(description, func) {
    var threw = false;
    try {
        func();
    }
    catch (err) {
        threw = true;
    }
    assert(threw, description);
}

var gpio = require("gpio");
var pins = require("arduino101_pins");

// test GPIO open
var pinA, pinB, aValue, bValue;

pinA = gpio.open({ pin: pins.IO2 });
pinB = gpio.open({ pin: pins.IO4, direction: "in" });

assert(pinA != null && typeof pinA == "object",
      "open: defined pin and default as 'out' direction");

assert(pinB != null && typeof pinB == "object",
      "open: defined pin with direction 'in'");

expectThrow("open: invalid pin", function () {
    gpio.open({ pin: 1024 });
});

// test GPIOPin read and write
pinA.write(true);
bValue = pinB.read();
assert(bValue, "gpiopin: write and read");

aValue = pinA.read();
assert(aValue, "gpiopin: read output pin");

pinB.write(false);
bValue = pinB.read();
assert(bValue, "gpiopin: write input pin");

expectThrow("gpiopin: write invalid argument", function () {
    pinA.write(1);
});

// test activeLow
pinB = gpio.open({ pin: pins.IO4, activeLow:true, direction: "in" });
pinA.write(false);
bValue = pinB.read();
assert(bValue, "activeLow: true");

// test GPIOPin onchange
var changes = {"any": 2,
               "rising": 1,
               "falling": 1};

function testChangeWithEdge(key, inital) {
    var count = 0;
    pinA.write(inital);

    pinB = gpio.open({ pin: pins.IO4, direction: "in", edge: key });
    pinB.onchange = function () {
        count++;
        pinA.write(inital);
    };

    pinA.write(!inital);

    setTimeout(function () {
        assert(count == changes[key],
              "gpiopin: onchange with edge '" + key + "'");

        if(key == "any") {
            testChangeWithEdge("rising", false);
        } else if(key == "rising") {
            testChangeWithEdge("falling", true);
        }
    }, 200);
}

testChangeWithEdge("any", false);

// test GPIOPin close
setTimeout(function () {
    var expected = true;
    pinA.write(false);
    pinB = gpio.open({ pin: pins.IO4, direction: "in", edge: "any" });
    pinB.onchange = function (event) {
        expected = event.value;
        pinB.close();
        pinA.write(false);
    };
    pinA.write(true);

    setTimeout(function () {
        assert(expected, "gpiopin: close onchange");
    }, 200);
}, 1000);

// test GPIO openAsync
gpio.openAsync({ pin: pins.IO2 }).then(function(pin2) {
    assert(pin2 != null && typeof pin2 == "object",
          "openAsync: defined pin and default as 'out' direction");
    gpio.openAsync({ pin: pins.IO4, direction: "in", edge: "any" })
        .then(function(pin4) {
            pin4.onchange = function (event) {
                assert(true, "gpiopin: onchange in openAsync");
            };
            pin2.write(true);
            var pin4v = pin4.read();
            assert(pin4v, "gpiopin: read and write in openAsync");
    });
    pin2.write(false);
});

setTimeout(function () {
    console.log("TOTAL: " + passed + " of " + total + " passed");
}, 1500);

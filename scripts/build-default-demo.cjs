const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const repoPublic = path.resolve(__dirname, "../public");
const projectDir = "/tmp/mb-action-demo";

const source = `function sendButton(button: string, event: string, label: string) {
    serial.writeLine('{"type":"button","button":"' + button + '","event":"' + event + '","label":"' + label + '"}')
}

function sendGesture(event: string) {
    serial.writeLine('{"type":"gesture","event":"' + event + '"}')
}

function sendMicrophone(event: string) {
    serial.writeLine('{"type":"microphone","event":"' + event + '"}')
}

function emitSensors() {
    serial.writeLine('{"type":"accelerometer","x":' + input.acceleration(Dimension.X) + ',"y":' + input.acceleration(Dimension.Y) + ',"z":' + input.acceleration(Dimension.Z) + '}')
    serial.writeLine('{"type":"magnetometer","x":' + input.magneticForce(Dimension.X) + ',"y":' + input.magneticForce(Dimension.Y) + ',"z":' + input.magneticForce(Dimension.Z) + '}')
    serial.writeLine('{"type":"temperature","celsius":' + input.temperature() + '}')
}

function updateMicrophone() {
    const level = input.soundLevel()
    const isLoud = level >= 80
    const isQuiet = level <= 45

    if (isLoud && !micWasLoud) {
        sendMicrophone("loud")
        micWasLoud = true
    } else if (isQuiet && micWasLoud) {
        sendMicrophone("quiet")
        micWasLoud = false
    }
}

input.onButtonPressed(Button.A, function () {
    sendButton("A", "click", "Click")
})

input.onButtonPressed(Button.B, function () {
    sendButton("B", "click", "Click")
})

input.onButtonPressed(Button.AB, function () {
    sendButton("AB", "click", "Click")
})

input.onGesture(Gesture.Shake, function () {
    sendGesture("shake")
})

input.onGesture(Gesture.TiltLeft, function () {
    sendGesture("tiltLeft")
})

input.onGesture(Gesture.TiltRight, function () {
    sendGesture("tiltRight")
})

input.onGesture(Gesture.LogoUp, function () {
    sendGesture("faceUp")
})

input.onGesture(Gesture.LogoDown, function () {
    sendGesture("faceDown")
})

input.onGesture(Gesture.FreeFall, function () {
    sendGesture("freefall")
})

input.onGesture(Gesture.ThreeG, function () {
    sendGesture("acceleration3g")
})

input.onGesture(Gesture.SixG, function () {
    sendGesture("acceleration6g")
})

input.onGesture(Gesture.EightG, function () {
    sendGesture("acceleration8g")
})

input.onLogoEvent(TouchButtonEvent.Touched, function () {
    sendButton("Logo", "down", "Pressed")
})

input.onLogoEvent(TouchButtonEvent.Released, function () {
    sendButton("Logo", "up", "Released")
})

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    sendButton("Logo", "click", "Click")
})

input.onSound(DetectedSound.Loud, function () {
    sendMicrophone("loud")
    micWasLoud = true
})

input.onSound(DetectedSound.Quiet, function () {
    sendMicrophone("quiet")
    micWasLoud = false
})

serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let command = serial.readLine()
    if (command.indexOf("\\"type\\":\\"show_text\\"") >= 0) {
        basic.showString("Hi")
    } else if (command.indexOf("\\"type\\":\\"clear_display\\"") >= 0) {
        basic.clearScreen()
    } else if (command.indexOf("\\"type\\":\\"set_led\\"") >= 0) {
        led.plot(2, 2)
    } else if (command.indexOf("\\"type\\":\\"ping\\"") >= 0) {
        serial.writeLine('{"type":"button","button":"AB","event":"click","label":"Pong"}')
    }
})

input.setSoundThreshold(SoundThreshold.Loud, 80)
input.setSoundThreshold(SoundThreshold.Quiet, 45)

let aPressed = false
let bPressed = false
let abPressed = false
let in2gWindow = false
let inTiltUpWindow = false
let inTiltDownWindow = false
let micWasLoud = false

basic.showIcon(IconNames.Heart)
serial.writeLine('{"type":"button","button":"AB","event":"click","label":"Serial ready"}')

basic.forever(function () {
    const aNow = input.buttonIsPressed(Button.A)
    const bNow = input.buttonIsPressed(Button.B)
    const abNow = input.buttonIsPressed(Button.AB)

    if (aNow && !aPressed) {
        sendButton("A", "down", "Pressed")
    } else if (!aNow && aPressed) {
        sendButton("A", "up", "Released")
    }

    if (bNow && !bPressed) {
        sendButton("B", "down", "Pressed")
    } else if (!bNow && bPressed) {
        sendButton("B", "up", "Released")
    }

    if (abNow && !abPressed) {
        sendButton("AB", "down", "Pressed")
    } else if (!abNow && abPressed) {
        sendButton("AB", "up", "Released")
    }

    aPressed = aNow
    bPressed = bNow
    abPressed = abNow

    const pitch = input.rotation(Rotation.Pitch)
    if (pitch > 70 && !inTiltUpWindow) {
        sendGesture("tiltUp")
    }
    if (pitch < -70 && !inTiltDownWindow) {
        sendGesture("tiltDown")
    }
    inTiltUpWindow = pitch > 50
    inTiltDownWindow = pitch < -50

    const magnitude = Math.max(
        Math.max(Math.abs(input.acceleration(Dimension.X)), Math.abs(input.acceleration(Dimension.Y))),
        Math.abs(input.acceleration(Dimension.Z))
    )
    const nowStrong = magnitude >= 1800
    if (nowStrong && !in2gWindow) {
        sendGesture("acceleration2g")
    }
    in2gWindow = nowStrong

    updateMicrophone()
    emitSensors()
    basic.pause(250)
})
`;

if (!fs.existsSync(path.join(projectDir, "pxt.json"))) {
  throw new Error(`Expected MakeCode project at ${projectDir}. Create it before running this script.`);
}

fs.writeFileSync(path.join(projectDir, "main.ts"), source);
execSync("npx -y pxt build", { cwd: projectDir, stdio: "inherit" });
fs.copyFileSync(path.join(projectDir, "built", "binary.hex"), path.join(repoPublic, "usb-serial-demo.hex"));
fs.writeFileSync(path.join(repoPublic, "usb-serial-demo.makecode.txt"), source);
console.log("Updated usb-serial-demo.hex");

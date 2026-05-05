bluetooth.onBluetoothConnected(function () {
    basic.showIcon(IconNames.Yes)
})
input.onButtonPressed(Button.A, function () {
    music.playSoundEffect(music.builtinSoundEffect(soundExpression.spring), SoundExpressionPlayMode.InBackground)
    basic.showIcon(IconNames.Happy)
})
input.onGesture(Gesture.ScreenDown, function () {
    music.playSoundEffect(music.createSoundEffect(WaveShape.Sine, 849, 1, 255, 0, 1000, SoundExpressionEffect.None, InterpolationCurve.Linear), SoundExpressionPlayMode.UntilDone)
    basic.showIcon(IconNames.Asleep)
})
input.onButtonPressed(Button.AB, function () {
    if (input.lightLevel() > 50) {
        basic.showLeds(`
            # . # . #
            . # # # .
            # # # # #
            . # # # .
            # . # . #
            `)
    } else {
        basic.showLeds(`
            . . # # .
            . . . # #
            . . . # #
            . . . # #
            . . # # .
            `)
    }
})
input.onButtonPressed(Button.B, function () {
    music.playSoundEffect(music.builtinSoundEffect(soundExpression.sad), SoundExpressionPlayMode.InBackground)
    basic.showIcon(IconNames.Sad)
})
input.onGesture(Gesture.Shake, function () {
    basic.showLeds(`
        . # . # .
        . . . . .
        . . . . .
        # # # # #
        . . . . .
        `)
    music.playSoundEffect(music.createSoundEffect(WaveShape.Sine, 3041, 3923, 59, 255, 500, SoundExpressionEffect.Warble, InterpolationCurve.Linear), SoundExpressionPlayMode.InBackground)
    basic.showLeds(`
        . # . # .
        . . . . .
        . # # # .
        # . . . #
        . # # # .
        `)
    basic.showLeds(`
        . # . # .
        . . . . .
        . . . . .
        # # # # #
        . . . . .
        `)
})
input.onLogoEvent(TouchButtonEvent.Touched, function () {
    record.setMicGain(record.AudioLevels.Low)
    record.startRecording(record.BlockingState.Nonblocking)
    control.raiseEvent(33, 1)
    while (input.logoIsPressed()) {
        led.plotBarGraph(
        input.soundLevel(),
        255
        )
        basic.pause(5)
    }
    music.stopAllSounds()
    basic.clearScreen()
    control.raiseEvent(33, 2)
    record.playAudio(record.BlockingState.Blocking)
})
bluetooth.startAccelerometerService()
bluetooth.startLEDService()
bluetooth.startButtonService()
bluetooth.startIOPinService()
bluetooth.startMagnetometerService()
bluetooth.startTemperatureService()
music.playSoundEffect(music.builtinSoundEffect(soundExpression.hello), SoundExpressionPlayMode.InBackground)
basic.showIcon(IconNames.SmallHeart)

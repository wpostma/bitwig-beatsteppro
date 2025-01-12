Bitwig controller script for Arturia Beatstep Pro.

The script:
  * creates 3 note inputs: sequencer 1, sequencer 2, and drum
  * uses the default channels of 1, 2, and 10 for each of the Beatstep Pro's sequencers
  * expects control mode to be channel 3, which enables
    * encoders 1-8 to control cursor device parameters
    * encoders 9-16 control cursor device macros
    * steps 1 / 2 are previous track / next track
    * steps 3 / 4 are previous device / next device on selected track
    * steps 5 / 6 close / open preset browser for selected device
    * steps 7 / 8 are previous / next preset in preset browser
    * step 9 toggles cursor device off / on
    * top row pads 1,2,3 toggle record arm, solo, mute for selected track
    * bottom row pads 1 / 2 decrease / increase selected track volume
  * supports clock sync from Bitwig; set sync to USB mode on BSP

For the encoders and step buttons to work correctly, you need to load the "BeatstepBitwig.beatsteppro" template on to your BSP via Arturia's MIDI Control Center software.  This is the default factory template with the following modifications

  * the encoder knobs are configured to send relative increment/decrement values for knob turns; this enables proper control of device params and macros within Bitwig.
  * the step buttons are configured to send CCs to both MIDI and USB ports (factory template doesn't send to USB+MIDI, just MIDI)

This script draws inspiration from https://github.com/justlep/bitwig/tree/master/doc/ArturiaBeatstepPro and https://github.com/cyhex/BeatstepProController.

**Installation**

  1. Get a copy of the latest release zip or clone this repo direct to Controller Scripts
  2. If you got the zip unzip to Documents/Bitwig/Controller Scripts.

Based on Factotumo from here:
https://github.com/benschmaus/bitwig-beatsteppro/release


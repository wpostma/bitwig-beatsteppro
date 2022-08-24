loadAPI(10); 

// BeatStepPro Controller Script for Bitwig 4.x


// constants
// Number of tracks, sends and scenes, they are called from the Launchpad.control.js file only during the init() function
var NUM_TRACKS = 40;
var NUM_SENDS = 2;
var NUM_SCENES = 8;
var NUM_EFFECT_TRACKS = 1;
var NUM_EFFECT_SCENES = 1;
var NUM_REMOTE_CONTROLS = 8;

// knobs: relative1
//  cc 20,21,22,23,   24,25,26,27, 28,29,30,31,  35,36,37,38

host.defineController("Arturia-Custom", "Arturia BeatStepPro", "2.0", "9694E601-0A0E-4535-8A7A-2F935A1BB285");
//host.addDeviceNameBasedDiscoveryPair(["Arturia BeatStep Pro","Arturia BeatStep Pro Arturia BeatStepPro"],["Arturia BeatStep Pro","Arturia BeatStep Pro Arturia BeatStepPro"]);
host.defineMidiPorts(1, 1);

var bsp = {
 // encoderCCs: [10,74,71,76,77,93,73,75,114,18,19,16,17,91,79,72]  // old
  encoderCCs: [20,21,22,23,  24,25,26,27,  28,29,30,31,  35,36,37,38 ]
};

var bitwig = {
  primaryDevice: null,
  cursorTrack: null,
  cursorDevice: null,
  application: null,
  transport: null,
  remoteControls: null,
  playing: 0
};



function init() {
    var mo = host.getMidiOutPort(0);

    var mi = host.getMidiInPort(0);
    mi.setMidiCallback(onMidi);
    mi.setSysexCallback(onSysex);

    // channels 1, 2, and 10 for the BSP's sequencers
    mi.createNoteInput("s1", "?0????").setShouldConsumeEvents(false);
    mi.createNoteInput("s2", "?1????").setShouldConsumeEvents(false);
    mi.createNoteInput("drum", "?9????").setShouldConsumeEvents(false);

    bitwig.application =  host.createApplication();
    bitwig.transport = host.createTransport();
    bitwig.transport.isPlaying().markInterested();
    bitwig.transport.addIsPlayingObserver (function(pPlaying) {
       bitwig.playing = pPlaying;
       println("playing "+bitwig.playing);
      
    });
    bitwig.transport.getClipLauncherPostRecordingTimeOffset().markInterested();
	  bitwig.transport.defaultLaunchQuantization().markInterested();
    bitwig.trackBank =  host.createMainTrackBank(NUM_TRACKS, NUM_SENDS, NUM_SCENES)

    bitwig.primaryDevice = host.createArrangerCursorTrack(2, 0).getPrimaryDevice();
  
    /* API1 
      for (var i = 0; i < 8; i++) {
        var deviceParam = bitwig.primaryDevice.getParameter(i);
        deviceParam.setIndication(true);

        var macro = bitwig.primaryDevice.getMacro(i).getAmount();
        macro.setIndication(true);
    }
    */

    bitwig.cursorTrack = host.createArrangerCursorTrack(8, 8);
    //bitwig.cursorTrack.addNoteObserver(seqPage.onNotePlay);
   
   
    bitwig.cursorDevice = host.createEditorCursorDevice();
    bitwig.cursorDevice.exists().markInterested(); 
    bitwig.cursorDevice.getChannel().getSolo().markInterested(); 
    bitwig.cursorDevice.getChannel().getMute().markInterested(); 
   
    bitwig.remoteControls = bitwig.cursorDevice.createCursorRemoteControlsPage(NUM_REMOTE_CONTROLS); // replaces device Param/macro.

    bitwig.deviceBrowser = bitwig.cursorDevice.createDeviceBrowser(8,8); // num_of_filter_column, num_of_results_columns
    
    /*
    for(var t=0; t<NUM_TRACKS; t++)
    {
       var track = bitwig.trackBank.getChannel(t);
 
       bitwig.trackBank.getChannel(t).isActivated().markInterested();
       track.getVolume().addValueObserver(8, getTrackObserverFunc(t, volume));
       track.getPan().addValueObserver(userVarPans, getTrackObserverFunc(t, pan));
       track.getSend(0).addValueObserver(8, getTrackObserverFunc(t, sendA));
       track.getSend(1).addValueObserver(8, getTrackObserverFunc(t, sendB));    
       track.getMute().addValueObserver(getTrackObserverFunc(t, mute));
       track.getSolo().addValueObserver(getTrackObserverFunc(t, solo));
       track.getArm().addValueObserver(getTrackObserverFunc(t, arm));
       track.getIsMatrixStopped().addValueObserver(getTrackObserverFunc(t, isMatrixStopped));
       track.exists().addValueObserver(getTrackObserverFunc(t, trackExists));
       track.addVuMeterObserver(7, -1, true, getTrackObserverFunc(t, vuMeter));
       track.addIsSelectedObserver(getTrackObserverFunc(t, isSelected));
       track.addIsQueuedForStopObserver(getTrackObserverFunc(t, isQueuedForStop));
        
 
       var clipLauncher = track.getClipLauncherSlots();
 
       clipLauncher.addHasContentObserver(getGridObserverFunc(t, hasContent));
       clipLauncher.addIsPlayingObserver(getGridObserverFunc2(t, isPlaying));
       clipLauncher.addIsRecordingObserver(getGridObserverFunc(t, isRecording));
       clipLauncher.addIsQueuedObserver(getGridObserverFunc(t, isQueued));
       clipLauncher.addIsStopQueuedObserver(getGridObserverFunc(t, isStopQueued)); 
       clipLauncher.addIsSelectedObserver(getGridObserverFunc(t, isSelected));      
         
    }
    */

    
    println("done init");
}

function onMidi(status, data1, data2) {
   var command = status & 0xf0;
   var channel = (status & 0x0f) + 1;
   
   println("channel=" + channel + ", command=" + command + ", data1=" + data1 + ", data2=" + data2);

   if (status == 146) {
      switch (data1) {
        case 44:
          doActionOnGateOpen(data2, function() {
            bitwig.cursorTrack.getArm().toggle();
          });
          break;
        case 45:
          doActionOnGateOpen(data2, function() {
            bitwig.cursorTrack.getSolo().toggle(false);
          });
          break;
        case 46:
          doActionOnGateOpen(data2, function() {
            bitwig.cursorTrack.getMute().toggle();
          });
          break;
        case 36:
          doActionOnGateOpen(data2, function() {
            bitwig.cursorTrack.getVolume().inc(-5, 128);
          });
          break;
        case 37:
          doActionOnGateOpen(data2, function() {
            bitwig.cursorTrack.getVolume().inc(5, 128);
          });
          break;
        default:
          break;
      }
   }

   if ((command == 176)&&(channel==3)) { // expect messages in control mode to come over channel 3
     var encoderCCIdx = bsp.encoderCCs.indexOf(data1);

      println("encoder " +encoderCCIdx + " ==> " + data2 )
     if (encoderCCIdx != -1) {
         if (encoderCCIdx < 8) {
             //handleEncoderChange(data2, bitwig.cursorDevice.getParameter(encoderCCIdx), "parameter "+(encoderCCIdx) );
             handleEncoderChange(data2, bitwig.remoteControls.getParameter(encoderCCIdx), "parameter "+(encoderCCIdx) );

         } else {
           println("skip");
            // deprecated: getMacro.
            //  handleEncoderChange(data2, bitwig.cursorDevice.getMacro(encoderCCIdx - 8).getAmount(), "macro "+(encoderCCIdx) );
         }
     }
   }
   else if ((channel==1) && (command==176)) {
      
    switch (data1) {
      case 20:
        doActionOnGateOpen(data2, function() {
          println("previous track");
          bitwig.cursorTrack.selectPrevious();
        });
        break;
      case 21:
        doActionOnGateOpen(data2, function() {
          println("next track");
          bitwig.cursorTrack.selectNext();
        });
        break;
      case 22:
        doActionOnGateOpen(data2, function() {
          println("previous device");
          bitwig.cursorDevice.selectPrevious();
        });
        break;
      case 23:
        doActionOnGateOpen(data2, function() {
          println("next device");
          bitwig.cursorDevice.selectNext();
        });
        break;
      case 24:
        doActionOnGateOpen(data2, function() {
           println("browse");
          bitwig.deviceBrowser.startBrowsing();
          bitwig.cursorBrowingSession = bitwig.deviceBrowser.createCursorSession();
        });
        break;
      case 25:
        doActionOnGateOpen(data2, function() {
           println("commit/close");
          bitwig.deviceBrowser.commitSelectedResult();
        });
        break;
      case 26:
        doActionOnGateOpen(data2, function() {
          println("previous browse")
           try {
          bitwig.cursorBrowingSession.getCursorResult().selectPrevious();
           }
           catch {

           }
        });
        break;
      case 27:
        doActionOnGateOpen(data2, function() {
          println("next browse");
          try {
          bitwig.cursorBrowingSession.getCursorResult().selectNext();
          }
          catch {

          }
        });
        break;
      case 28:
        doActionOnGateOpen(data2, function() {
          println("enable/disable")
          bitwig.cursorDevice.toggleEnabledState();
        });
        break;
      case 29:
        doActionOnGateOpen(data2, function() {
         
          println("undo");
          bitwig.application.undo();
        });
        break;
      case 30:
        doActionOnGateOpen(data2, function() {
          println("redo");
          bitwig.application.redo();
        });
        break;
      case 31:
        doActionOnGateOpen(data2, function() {
          //println("previous selection");
          //bitwig.application.selectPrevious(); // api 10
            println("toggle browse media");
          bitwig.application.toggleBrowserVisibility();
        });
        break;
      case 52:
        doActionOnGateOpen(data2, function() {
          //println("next selection");
          //bitwig.application.selectNext(); //api 10
          println("device panel toggle");
          bitwig.application.toggleDevices();
        });
        break;
      case 53:
        break;
      case 54:
        break;
      case 55:
        break;
      default:
        break;
    }
 }

}

function doActionOnGateOpen(data2, f) {
  if (data2 > 0) {
    f();
  }
}

function handleEncoderChange(value, paramOrMacro, debug) {
    if (value == 64) { return; }
    // -1 for knob turn left, +1 for knob turn right
    var diff = value-64;
    println(debug+" "+diff);
    paramOrMacro.inc(diff, 128);
}

function onSysex(sysex) { }

function exit() { }


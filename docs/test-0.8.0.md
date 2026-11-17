# 0.8.0 owner test pass

Use the Mac app and matching companion from the same candidate artifact. Close the running older app before replacing it in Applications. Extract the separate companion ZIP and update/reload its unpacked folder in the browser profile used for YouTube Music. This preview is ad-hoc signed and not notarized by Apple.

1. **Saved FM cities.** Open RADIO, then LIBRARY. FM city should offer Device location, Nantes, Rennes, Menton and Kyiv, plus directories already fetched on this installation. Select Menton while physically in Nantes. The dial/Next/Prev queue should use Menton; the current stream should continue until another station is selected. Try Rennes and Kyiv, then restart the app and confirm the selection persists. Return to Device location to restore the actual device city.
2. **Nantes tuning.** Allow device location when requested. Check that the city is Nantes and local cards have real FM frequencies. Drag the dial and use Next/Prev. SEEK should skip failed online streams, try compatible alternatives and stop when audio starts. Pause cancels a pending search. Global online search remains separate from the local dial.
3. **LOCAL dictaphone.** Press REC, allow microphone access and speak. Pause and continue, then STOP and Save as WAV. Play the saved file and check the voice, duration and pause gap. The microphone should stop after STOP or source change.
4. **RADIO recording.** Start a working station, record 15–20 seconds, pause/continue and STOP/save. Listen to the resulting WAV. Hiding the player should keep playback/recording running.
5. **YT MUSIC sample.** Start a track with the matching companion connected. Press desktop REC and explicitly choose START RECORDING in the companion on the active YouTube Music tab. Check continued listening, desktop recording progress, pause/continue and STOP/save. Switching source should end capture and offer to save.

Kyiv currently has partial online coverage: 35 reviewed FM service facts do not mean 35 working streams. The final test record lists actual decoder successes.

Record the city/station/frequency and visible error for a failure. Automated generated-audio tests and remote muted decoder checks are already recorded separately in smoke-test.md; they do not replace native permissions, listening or real browser-tab acceptance. A new-place test needs a real new location or a reviewed explicit addition; this interface intentionally does not import arbitrary unvisited city catalogs.

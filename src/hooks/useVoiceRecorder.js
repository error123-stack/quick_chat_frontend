import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";

const useVoiceRecorder = (sendAudioMessage) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaChunksRef = useRef([]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder?.state === "recording") {
      recorder.stop();
      setIsRecording(false);
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Audio recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      mediaChunksRef.current = [];

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          mediaChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = async () => {
        const audioBlob = new Blob(mediaChunksRef.current, {
          type: "audio/webm",
        });
        mediaChunksRef.current = [];
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;

        if (audioBlob.size > 0) {
          await sendAudioMessage(audioBlob);
        } else {
          toast.error("No audio captured.");
        }
      };

      recorder.start();
      setIsRecording(true);
      toast.success("Recording started. Tap again to send.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to access microphone.");
      setIsRecording(false);
    }
  }, [sendAudioMessage]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
      return;
    }
    startRecording();
  }, [isRecording, startRecording, stopRecording]);

  return { isRecording, toggleRecording };
};

export default useVoiceRecorder;

import React, { useEffect } from 'react';
import styles from '../page.module.css'
function Timer({ seconds, timesUpHandler, setSeconds, isActive }) {

  const formatSecondsToHHmmss = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  useEffect(() => {
    const storedSeconds = localStorage.getItem('seconds');
    if (storedSeconds) {
        setSeconds(parseInt(storedSeconds, 10));
    }
  }, []);

  useEffect(() => {

    let intervalId;
    if (isActive && seconds > 0) {
      intervalId = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds <= 1) {
            clearInterval(intervalId);
            timesUpHandler();
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isActive]);

  useEffect(() => {
    localStorage.setItem('seconds', seconds);
  }, [seconds]);




  return (
    <div className={styles.timer}>
      <h1>Timer: {formatSecondsToHHmmss(seconds)} </h1>
    </div>
  );
}

export default Timer;
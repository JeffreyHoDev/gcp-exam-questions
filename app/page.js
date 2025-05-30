import styles from "./page.module.css";
import Link from 'next/link'


export default function Home() {
  
  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>GCP Cloud Architecture Exam</h1>
      </div>
      <div className={styles.listItems}>
        <ul>
          <li className={styles.listItem}>There are 60 questions in total. The first 50 questions are general questions, and the last 10 questions are based on two randomly chosen case studies.</li>
          <li className={styles.listItem}>You have 2 hours to finish the questions, and the timer is continuous and cannot be paused</li>
          <li className={styles.listItem}>The system will automatically calculate your score when time is up, and you will not be able to continue answering questions</li>
          <li className={styles.listItem}>After submitting, the number of correctly answered questions will be displayed at the end</li>
        </ul>
      </div>
      <div className={styles.important}>
        <h2>IMPORTANT</h2>
        <ul>
          <li>It is recommended to use a desktop instead of a mobile device, as some questions involve images that may not display well on mobile screens.</li>
          <li>Clicking &apos;Go back&apos; in the browser will reset all questions. Please avoid doing this while attempting the exam</li>
          <li>Clicking the submit button will move to the score calculation stage, so ensure you have attempted all questions before submitting</li>
        </ul>
      </div>
      <div>
        <Link href="/exam"><button className={styles.startbtn}>Start</button></Link>
      </div>
    </div>
  );
}

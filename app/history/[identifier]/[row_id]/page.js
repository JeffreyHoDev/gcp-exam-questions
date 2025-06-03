'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import styles from "./historyDetail.module.css";

import Image from "next/image";
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Divider from '@mui/material/Divider';

import clsx from 'clsx';
import Link from 'next/link';
import {idWithQuestionImage} from "../../../exam/data"

import QuestionImage from "../../../exam/questionimage.component"
import OptionImage from "../../../exam/optionimage.component";

const handleCharToIndex = (char) => {
  let reference =  {
    "A": 0,
    "B": 1,
    "C": 2, 
    "D": 3,
    "E": 4,
    "F": 5
  }
  let index = reference[char]
  return index
  
}

const handleSingleSelectedChoice = (qnum) => {
    let choiceIndex = qnum["choices"].findIndex(el => el === true)
    return choiceIndex
}

const compareChoicesAndAnswersForMultipleChoices = (answerArray, optionIndex) => {
    let newAnswerIndexArray = Array.from(answerArray)
    newAnswerIndexArray = newAnswerIndexArray.map(answer => handleCharToIndex(answer))
    if(newAnswerIndexArray.includes(optionIndex)){
        return true
    }else {
        return false
    }
}




export default function HistoryDetailPage () {
    const router = useRouter();
    const { identifier, row_id } = useParams();
    const [historyDetail, setHistoryDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [number, setNumber] = useState(0)
    const [arrayOfIndexAnswerWrong, setArrayOfIndexAnswerWrong] = useState([])


    useEffect(() => {
        const loginIdentity = sessionStorage.getItem('loginIdentity');
        const loginID = sessionStorage.getItem('loginID');
        if (!loginIdentity || !loginID) {
            router.replace('/history');
        }
    }, [router]);


    const calcScore = () => {

        historyDetail.questions.map((question, index) => {
        const {answers, choices} = question
        // handle question with single answer
        if(answers.length < 2) {
            let answer_index = handleCharToIndex(answers[0])
            let choice_index = choices.findIndex(el => el === true)

            if(answer_index === choice_index){

            }else {
            setArrayOfIndexAnswerWrong(prev => [...prev, index])
            }
        }else {
            let answerWithIndex = answers.map(answer => handleCharToIndex(answer)) // [0, 1 , 2]

            let countOfAnswer = answerWithIndex.length

            let countOfCorrectAnswers = 0
            let choicesIndex = [] 
            choices.map((el, index) => {
            if(el === true){
                choicesIndex.push(index)
            }
            })
            choicesIndex.map(choice => {
            if(answerWithIndex.includes(choice)){
                countOfCorrectAnswers += 1
            }
            })

            if(countOfAnswer === countOfCorrectAnswers){

            }else {
            setArrayOfIndexAnswerWrong(prev => [...prev, index])
            }

        }

        })
    }

    useEffect(() => {
        const handleUnload = () => {
            sessionStorage.removeItem('historyList');
            sessionStorage.removeItem('loginIdentity');
            sessionStorage.removeItem('loginID');
        };
        window.addEventListener('beforeunload', handleUnload);
        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, []);

    const compareChosenAndAnswer = (question_num, current_index) => {

        if(historyDetail.questions[question_num]["answers"].length === 1){

        let chosenIndex = historyDetail.questions[question_num]["choices"].findIndex(el => el === true)
        if(current_index === chosenIndex){
            let answerIndex = handleCharToIndex(historyDetail.questions[question_num]["answers"][0])
            // If same return true
            if(chosenIndex !== answerIndex){
            return false
            }
        }
        }else {
            let newCopyOfAnswer = Array.from(historyDetail.questions[question_num]["answers"])
            let arrayOfAnswerIndex = newCopyOfAnswer.map(answer => handleCharToIndex(answer))
            if(historyDetail.questions[question_num]["choices"][current_index]){
                if(arrayOfAnswerIndex.includes(current_index)){
                    return true
                }
                else {
                    return false
                }
            }
        }
        return true
    }



    useEffect(() => {
        const fetchHistoryDetail = async () => {
            try {
                const response = await fetch(`https://${process.env.NEXT_PUBLIC_BACKEND}/historyDetails`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ identifier, row_id }),
                });
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                const data = await response.json();
                setHistoryDetail(data);
            } catch (error) {
                console.error('Error fetching history detail:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchHistoryDetail();
    }, [row_id]);

    useEffect(() => {
        if (historyDetail) {
            calcScore();
        }
    }, [historyDetail]);
    
    if (loading) return <div>Loading...</div>;
    if (!historyDetail) return <div>No history detail found</div>;
    
    return (
        <div className={styles.historyDetailPage}>
            <Link href="/history" className={styles.historyLink}>Back to History List</Link>
            <h1>History Detail for User ID: {historyDetail.identifier_id}</h1>
            <h2>Exam ID: {historyDetail.id}</h2>
            <h2>Score: {historyDetail.score}</h2>
            <div className={styles.exam_page_section}>
                <Box
                    sx={{
                    pt: 2,
                    px: 2,
                    display: {
                        xs: 'none',   // hide on xs
                        sm: 'none',   // show on sm
                        md: 'grid',   // show on md and up
                    },
                    gridTemplateColumns: {
                        md: 'repeat(10, 1fr)',
                        lg: 'repeat(12, 1fr)',
                        xl: 'repeat(20, 1fr)',
                    },
                    gap: 1,
                    }}
                >
                    {historyDetail.questions.map((question, index) => (
                        <Button
                            variant="contained"
                            style={{'backgroundColor': arrayOfIndexAnswerWrong.includes(index) ? '#FF6363' : '#C7E9C0', 'color': number === index ? '#2E8BC0' : '#000000', 'border': '1px solid #2E8BC0'}}
                            key={`${question.id}-history-question-${index}`}
                            fullWidth
                            sx={{ width: '100%' }}
                            onClick={() => setNumber(index)}
                            >
                            {index + 1} 
                        </Button>
                    ))}
                </Box>
            </div>
            <div className={styles.question_body}>
                <Paper elevation={10} sx={{padding: '20px 20px'}}>
                    <p className={styles.question_html} dangerouslySetInnerHTML={{ __html: `${number+1}. ${historyDetail.questions[number]["questions"]}` }}></p>
                    {!idWithQuestionImage.includes(historyDetail.questions[number]["id"]) ? null : historyDetail.questions[number]["id"] >= 239 ? <div style={{'position': 'relative', 'height': '200px', 'width': '500px'}}><Image src={`/images/question${240}_image.png`} style={{ objectFit: 'contain' }} fill={true} alt="question image"/></div> : <QuestionImage questionId={historyDetail.questions[number]["id"]}/>}
                    <Divider component="div" />
                    <div className={styles.option_body}>
                      {
                        historyDetail.questions[number]["answers"].length > 1 ?
                        (
                        
                        <FormGroup>
                          {
                            historyDetail.questions[number]["options"].map((option, optionindex) => (
                              <FormControlLabel
                                className={clsx(
                                  styles.optionLabel,
                                  compareChoicesAndAnswersForMultipleChoices(historyDetail.questions[number]["answers"], optionindex) && styles.correctOption,
                                !compareChosenAndAnswer(number, optionindex) && styles.incorrectOption
                                )}
                                key={`${historyDetail.questions[number]["id"]}-history-multiple-${optionindex}-options`}
                                control={
                                  <Checkbox
                                    disabled={true}
                                    checked={historyDetail.questions[number]["choices"][optionindex]}
                                  />
                                }
                                label={<span className={styles.label_self}>{option}</span>}
                              />
                            ))
                            
                          }
                        </FormGroup>)
                        : (
                            historyDetail.questions[number]["optionimage"] ? (
                            <RadioGroup
                              aria-labelledby="demo-radio-buttons-group-label"
                              name="radio-buttons-group"
                              value={handleSingleSelectedChoice(historyDetail.questions[number])}
                              
                            >
                            {
                              historyDetail.questions[number]["options"].map((option, optionindex) => {
                                const isCorrect = handleCharToIndex(questions[number]["answers"][0]) === optionindex;
                                const isIncorrect =  !compareChosenAndAnswer(number, optionindex);
      
                                return (
                                  <FormControlLabel
                                    className={clsx(
                                      styles.optionImageLabel,
                                      isCorrect && styles.correctOption,
                                      isIncorrect && styles.incorrectOption
                                    )}
                                    key={`${historyDetail.questions[number]["id"]}-history-single-${optionindex}`}
                                    value={optionindex}
                                    control={<Radio disabled={submitted} />}
                                    label={<OptionImage questionId={historyDetail.questions[number]["id"]} index={optionindex} />}
                                  />
                                );
                              })
                            }
                            </RadioGroup>
                            ): 
                            (
                            <RadioGroup
                              aria-labelledby="demo-radio-buttons-group-label"
                              name="radio-buttons-group"
                              value={handleSingleSelectedChoice(historyDetail.questions[number])}
                            >
                            {
                              historyDetail.questions[number]["options"].map((option, optionindex) => {
                                return <FormControlLabel   className={clsx(
                                  styles.optionLabel,
                                  compareChoicesAndAnswersForMultipleChoices(historyDetail.questions[number]["answers"], optionindex) && styles.correctOption,
                                    !compareChosenAndAnswer(number, optionindex) && styles.incorrectOption
                                )} key={`${historyDetail.questions[number]["id"]}-single-${optionindex}`} value={optionindex}  control={<Radio disabled={true}/>} label={<span className={styles.label_self}>{option}</span>} />
                              })
                            }
                            </RadioGroup>
      
                            )
                        )
                      }
                    </div>
                  </Paper>
            </div>
            <div className={styles.button_grouping}>
                {number !== 0 ? <button className={styles.prevBtn} sx={{width: {xs: 100, sm: 200, md: 300, lg: 300}}} onClick={() => setNumber(number-1)}>Previous</button> : <div></div>}
                {number !== historyDetail.questions.length-1 ?<button className={styles.nextBtn} sx={{width: {xs: 100, sm: 200, md: 300, lg: 300}}} onClick={() => setNumber(number+1)}>Next</button> :  <div></div>}
            </div>
        </div>
    );
}
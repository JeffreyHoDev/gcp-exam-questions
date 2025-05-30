'use client'

import styles from "../page.module.css";
import { useEffect, useState } from "react";
import { redirect } from 'next/navigation'
import Image from "next/image";
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Button from '@mui/material/Button';

import Timer from './timer.component'
import ResultModal from "./result-modal.component";
import PromptModal from "./prompt-modal.component";

import {idWithQuestionImage} from "./data"
import QuestionImage from "./questionimage.component";
import OptionImage from "./optionimage.component";
import CircleRoundedIcon from '@mui/icons-material/CircleRounded';

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import clsx from 'clsx';

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


export default function ExamPage() {

  const [questions, setQuestions] = useState([])
  const [isFetching, setIsFetching] = useState(false)
  const [number, setNumber] = useState(0)
  
  const [seconds, setSeconds] = useState(7200);
  const [isActive, setIsActive] = useState(true);

  const [scoreResult, setScore] = useState(0)
  const [calculatingScore, setIsCalculatingScore] = useState(false)

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [error, setError] = useState(null)

  const [promptOpen, setPromptOpen] = useState(false);
  const [arrayOfIndexAnswerWrong, setArrayOfIndexAnswerWrong] = useState([])
  const handlePromptOpen = () => setPromptOpen(true);
  const handlePromptClose = () => setPromptOpen(false);
  // Fetches questions from the backend API and updates the state.
  // Handles errors by setting the error state and stopping the fetching indicator.
  const getData = async () => {
    setIsFetching(true)
    try {
      let response = await fetch(`https://${process.env.NEXT_PUBLIC_BACKEND}/`)
      let data = await response.json()
      setQuestions(data)
      setIsFetching(false)
    }catch(err){
      setError(err)
      setIsFetching(false)
    }
  }

  const [submitted, setIsSubmitted] = useState(false)
  const resetAllData = () => {
    
    setQuestions([])
    setArrayOfIndexAnswerWrong([])
    setScore(0)
    handleClose()
    handlePromptClose()
    setIsActive(false)
    setIsSubmitted(false)
    localStorage.removeItem("seconds")
    sessionStorage.removeItem("reloaded")
    redirect('/')

  }


  useEffect(() => {
    if(localStorage.getItem("questions") && sessionStorage.getItem("reloaded") && JSON.parse(localStorage.getItem("questions")).length != 0){
      let data = localStorage.getItem("questions")
      setQuestions(JSON.parse(data))
    }else {
      getData()
    }
  }, [])



  useEffect(() => {
    if (sessionStorage.getItem("reloaded")) {
      // Was a reload
      if(localStorage.getItem("seconds")){
          setSeconds(localStorage.getItem("seconds"))
      }

    } else {
      // Was not a reload — assume fresh load

      localStorage.clear()
      sessionStorage.removeItem('reloaded')
    }
  }, []);

  useEffect(() => {
    const handleUnload = () => {
      sessionStorage.setItem("reloaded", "true");
    };

    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("unload", handleUnload);
      localStorage.removeItem('seconds')
      localStorage.removeItem('questions')
      sessionStorage.removeItem('reloaded')
    };
  }, []);



  useEffect(() => {
    localStorage.setItem("questions", JSON.stringify(questions))
  }, [questions]);

  const handleMultipleChoices = ( question_index, option_index) => {
    let newData = Array.from(questions)
    newData[question_index]["choices"][option_index] = !newData[question_index]["choices"][option_index]
    setQuestions(newData)
  }

  const handleSingleSelectedChoice = (qnum) => {
    let choiceIndex = qnum["choices"].findIndex(el => el === true)
    return choiceIndex
  }

  const timesUpHandler = () => {
    setIsSubmitted(true)
    localStorage.removeItem("seconds")
    sessionStorage.removeItem("reloaded")
  }

  useEffect(() => {
    if (submitted) {
    // Delay helps ensure UI events (like radio clicks) are flushed
      setTimeout(() => {
        calcScore();
      }, 100); // 100ms is enough for React to flush updates

      localStorage.removeItem("seconds")
      localStorage.removeItem("questions")
    }
  }, [submitted])


  const handleSingleAnswer = (question_index, event) => {
    let optionIndex = Number(event.target.value)
    let newData = Array.from(questions)
    let length = newData[question_index]["choices"].length
    for(let i = 0; i < length; i++){
      if(i !== optionIndex){
        newData[question_index]["choices"][i] = false
      }else {
        newData[question_index]["choices"][i] = true
      }
    }
    setQuestions(newData)
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

  const compareChosenAndAnswer = (question_num, current_index) => {
    if(submitted){
      if(questions[question_num]["answers"].length === 1){
  
        let chosenIndex = questions[question_num]["choices"].findIndex(el => el === true)
        if(current_index === chosenIndex){
          let answerIndex = handleCharToIndex(questions[question_num]["answers"][0])
          // If same return true
          if(chosenIndex !== answerIndex){
            return false
          }
        }
      }else {
        let newCopyOfAnswer = Array.from(questions[question_num]["answers"])
        let arrayOfAnswerIndex = newCopyOfAnswer.map(answer => handleCharToIndex(answer))
        if(questions[question_num]["choices"][current_index]){
          if(arrayOfAnswerIndex.includes(current_index)){
            return true
          }
          else {
            return false
          }
        }
      }
    }
    return true
  }


  const calcScore = () => {
    setIsActive(false)
    setIsCalculatingScore(true)
    handlePromptClose()
    handleOpen()
    let score = 0

    questions.map((question, index) => {
      const {answers, choices} = question
      // handle question with single answer
      if(answers.length < 2) {
        let answer_index = handleCharToIndex(answers[0])
        let choice_index = choices.findIndex(el => el === true)

        if(answer_index === choice_index){
          score++
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
          score++
        }else {
          setArrayOfIndexAnswerWrong(prev => [...prev, index])
        }

      }

    })
    setIsCalculatingScore(false)
    setScore(score)

  }

  
  return (
    <div>
      {
        isFetching ? <div className={styles.loading}><CircularProgress color="inherit" /><h3>Fetching Questions...</h3></div> : (
          <div>
            <div className={styles.exam_page_section}>
              {error ? <div><Alert severity="error">Encounter some error, message: <p>{error.message}</p></Alert></div> : null}
              <div>
                {error ? null : (
                  <p className={styles.legend}>
                    Once you have answered a question, an <span style={{ color: '#F97A00' }}>orange</span> dot will appear. Use this as an indicator of your progress.
                  </p>
                )}
                {
                  questions.length > 0 ? (
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
                      {questions.map((question, index) => (
                        <Button
                          variant="contained"
                          style={{'backgroundColor': submitted ? (arrayOfIndexAnswerWrong.includes(index) ? '#FF6363' : '#C7E9C0') : (number === index ? '#2E8BC0' : '#F5F5F5'), 'color': number === index ? '#FFFFFF' : '#000000', 'border': '1px solid #2E8BC0'}}
                          key={`${question.id}-question-${index}`}
                          fullWidth
                          sx={{ width: '100%' }}
                          onClick={() => setNumber(index)}
                        >
                          {index + 1} {question["choices"].includes(true) && !submitted ? <CircleRoundedIcon style={{paddingLeft: '.5rem', fontSize: '1.2rem', color: '#F97A00'}}/> : null}
                        </Button>
                      ))}
                    </Box>
                  ) : null
                }
              </div>
                {
                  questions.length > 0 ? <div className={styles.timer_section}><Timer timesUpHandler={timesUpHandler} seconds={seconds} setIsActive={setIsActive} setSeconds={setSeconds} isActive={isActive} /></div> : null
                }
              {
                questions.length > 0 ? (
                <div className={styles.question_body}>
                  <Paper elevation={10} sx={{padding: '20px 20px'}}>
                    <p className={styles.question_html} dangerouslySetInnerHTML={{ __html: `${number+1}. ${questions[number]["questions"]}` }}></p>
                    {!idWithQuestionImage.includes(questions[number]["id"]) ? null : questions[number]["id"] >= 239 ? <div style={{'position': 'relative', 'height': '200px', 'width': '500px'}}><Image src={`/images/question${240}_image.png`} style={{ objectFit: 'contain' }} fill={true} alt="question image"/></div> : <QuestionImage questionId={questions[number]["id"]}/>}
                    <Divider component="div" />
                    <div className={styles.option_body}>
                      {
                        questions[number]["answers"].length > 1 ?
                        (
                        
                        <FormGroup>
                          {
                            questions[number]["options"].map((option, optionindex) => (
                              <FormControlLabel
                                className={clsx(
                                  styles.optionLabel,
                                  submitted && compareChoicesAndAnswersForMultipleChoices(questions[number]["answers"], optionindex) && styles.correctOption,
                                  submitted && !compareChosenAndAnswer(number, optionindex) && styles.incorrectOption
                                )}
                                key={`${questions[number]["id"]}-multiple-${optionindex}-options`}
                                control={
                                  <Checkbox
                                    disabled={submitted}
                                    checked={questions[number]["choices"][optionindex]}
                                    onChange={() => handleMultipleChoices(number, optionindex)}
                                  />
                                }
                                label={<span className={styles.label_self}>{option}</span>}
                              />
                            ))
                            
                          }
                        </FormGroup>)
                        : (
                            questions[number]["optionimage"] ? (
                            <RadioGroup
                              aria-labelledby="demo-radio-buttons-group-label"
                              name="radio-buttons-group"
                              onChange={() => handleSingleAnswer(number, event)} 
                              value={handleSingleSelectedChoice(questions[number])}
                              
                            >
                            {
                              questions[number]["options"].map((option, optionindex) => {
                                const isCorrect = submitted && handleCharToIndex(questions[number]["answers"][0]) === optionindex;
                                const isIncorrect = submitted && !compareChosenAndAnswer(number, optionindex);
      
                                return (
                                  <FormControlLabel
                                    className={clsx(
                                      styles.optionImageLabel,
                                      isCorrect && styles.correctOption,
                                      isIncorrect && styles.incorrectOption
                                    )}
                                    key={`${questions[number]["id"]}-single-${optionindex}`}
                                    value={optionindex}
                                    control={<Radio disabled={submitted} />}
                                    label={<OptionImage questionId={questions[number]["id"]} index={optionindex} />}
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
                              onChange={() => handleSingleAnswer(number, event)} 
                              value={handleSingleSelectedChoice(questions[number])}
                            >
                            {
                              questions[number]["options"].map((option, optionindex) => {
                                return <FormControlLabel   className={clsx(
                                  styles.optionLabel,
                                  submitted && compareChoicesAndAnswersForMultipleChoices(questions[number]["answers"], optionindex) && styles.correctOption,
                                  submitted && !compareChosenAndAnswer(number, optionindex) && styles.incorrectOption
                                )} key={`${questions[number]["id"]}-single-${optionindex}`} value={optionindex}  control={<Radio disabled={submitted}/>} label={<span className={styles.label_self}>{option}</span>} />
                              })
                            }
                            </RadioGroup>
      
                            )
                        )
                      }
                    </div>
                  </Paper>
                </div>
                ) : null
              }
            </div>
            {error ? null : (
              <div className={styles.button_grouping}>
                {number !== 0 ? <button className={styles.prevBtn} sx={{width: {xs: 100, sm: 200, md: 300, lg: 300}}} variant="contained" onClick={() => setNumber(number-1)}>Previous</button> : <div></div>}
                {number !== questions.length-1 ?<button className={styles.nextBtn} sx={{width: {xs: 100, sm: 200, md: 300, lg: 300}}} variant="contained" onClick={() => setNumber(number+1)}>Next</button> :  <div></div>}
              </div>
            )}
            {error ? null : (
              <div className={styles.submit_btn_section}>
                {
                  submitted ? <button className={styles.submit_btn} onClick={() => resetAllData()}>Try again</button> : <button className={styles.submit_btn} onClick={() => handlePromptOpen()}>Submit</button>
                }
              </div>
            )}
            <div><ResultModal calculatingScore={calculatingScore} open={open} scoreResult={scoreResult} handleClose={handleClose} resetAllData={resetAllData}/></div>
            <div><PromptModal setIsSubmitted={setIsSubmitted} promptOpen={promptOpen} handlePromptClose={handlePromptClose}/></div>
          </div>
        )
      }
    </div>
  );
}

'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import Modal from '@mui/material/Modal';
import styles from '../page.module.css'

import { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: 360, sm: 400, md: 500, lg: 500 },
  bgcolor: 'background.paper',
  color: '#22223b',
  borderRadius: 8,
  border: 'none',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  textAlign: 'center',
  p: 6,
};

const buttonGroup = {
  display: 'flex',
  justifyContent: 'space-evenly',
  gap: '1.1em',
  alignItems: 'center',
  paddingTop: '3em'
}

export default function SaveQuestionPromptModal({ setPassword, password, isSavingQuestions, saveQuestions, savePromptOpen, handleSavePromptClose, scoreResult }) {
  const [identifier, setText] = useState('');
  return (
    <div>
      <Modal
        open={savePromptOpen}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h4 className={styles.promptTitle}>
            Please provide your identifier to save your exam questions.
          </h4>
          <input
            className={styles.promptInput}
            placeholder="Identifier*"
            onChange={(e) => setText(e.target.value)}
            value={identifier}
            />
          <input
            className={styles.promptInput}
            placeholder="Password*"
            type='password'
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            />
          <div style={buttonGroup}>
            <Button variant="contained" disabled={isSavingQuestions || identifier.length === 0 || password.length === 0} onClick={() => saveQuestions(identifier, password)}>Save  {isSavingQuestions ? <CircularProgress color="inherit" /> : ""}</Button>
            <Button variant="contained" disabled={isSavingQuestions} onClick={() => handleSavePromptClose()}>Close</Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

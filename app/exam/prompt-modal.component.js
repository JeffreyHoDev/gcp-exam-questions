import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import Modal from '@mui/material/Modal';
import styles from '../page.module.css'

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

export default function PromptModal({  setIsSubmitted, promptOpen, handlePromptClose }) {

  return (
    <div>
      <Modal
        open={promptOpen}
        onClose={handlePromptClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h4 className={styles.promptTitle}>
            Ready to submit?
          </h4>
          <div style={buttonGroup}>
            <Button variant="contained" onClick={() => setIsSubmitted(true)}>Yes</Button>
            <Button variant="contained" onClick={() => handlePromptClose()}>No</Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

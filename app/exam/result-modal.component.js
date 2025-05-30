import * as React from 'react';
import Box from '@mui/material/Box';

import Modal from '@mui/material/Modal';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import styles from "../page.module.css";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: 360, sm: 400, md: 600, lg: 600 },
  bgcolor: 'background.paper',
  color: '#22223b',
  borderRadius: 8,
  border: 'none',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  textAlign: 'center',
  p: 6,
};

const buttonStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5em',
  alignItems: 'center',
  paddingTop: '3em'
}

export default function ResultModal({ open, scoreResult, handleClose, resetAllData, calculatingScore }) {

  return (
        <div>
          <Modal
            open={open}
            // onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            className={styles.resultModal}

          >
            {
              calculatingScore ? <CircularProgress color="inherit" /> 
              : (
                <Box sx={style}>
                  <h3 className={styles.resultModal_text}>
                    Result
                  </h3>
                  {scoreResult >= 48 ?<h3 className={styles.resultModal_text} style={{'color': scoreResult >= 48 ? 'green': 'red'}}>Congratulations!</h3>  : null}
                  <h3 className={styles.resultModal_text} id="modal-modal-description" >
                    Your Score: <span style={{'color': scoreResult >= 48 ? 'green': 'red'}}>{scoreResult}</span>/60.
                  </h3>
                  <div style={buttonStyle}>
                    <Button variant='contained' sx={{width: {xs: 200, sm: 300, md: 500, lg: 500}}} onClick={() => resetAllData()}>Try again</Button>
                    <Button variant='contained' sx={{width: {xs: 200, sm: 300, md: 500, lg: 500}, marginTop: 5}} onClick={() => handleClose()}>Review Questions</Button>
                  </div>
                </Box>    
              ) 
            }
          </Modal>
        </div>
      )
}

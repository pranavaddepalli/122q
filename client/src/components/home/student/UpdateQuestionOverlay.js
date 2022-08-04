import React, { useState } from 'react';
import {
    Typography,
    Button,
    Dialog,
    Input,
} from '@mui/material'

export default function UpdateQuestionOverlay(props) {
    const { open, questionValue, setQuestionValue } = props
    
    const printAndClose = () => {
        console.log(questionValue);
    }

    return (
        <Dialog open={open}>
            <Typography variant='h6'>Please update your question! </Typography>
            <Typography variant='body1'>Your entry has been frozen on the queue.</Typography>
            <Typography variant='body1'>A TA has requested that you update your question. Before we can help you, we need more details from you. More specifically, we need to know what you've tried and already understand in addition to your question. Make sure to review *Insert Diderot link* for more help! </Typography>
            <Input 
                placeholder='Question (max 256 characters)'
                onChange={(event) => setQuestionValue(event.target.value)}
                inputProps={{ maxLength: 256 }}
            />
            <Button onClick={printAndClose}>Update Question</Button>
        </Dialog>
    );
}

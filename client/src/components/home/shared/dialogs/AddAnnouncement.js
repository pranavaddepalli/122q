
import React from 'react';
import {
    Box, Button, Dialog, DialogContent, Typography, TextField, Grid
} from '@mui/material'

export default function AddAnnouncement(props) {
    const { isOpen, onClose, setHeader, setContent, announcementInfo } = props

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
        >
            <DialogContent>
                <Typography sx={{ pb: 1, fontWeight: 'bold', fontSize: '22px', textAlign: 'center' }}>
                    Create New Announcement
                </Typography>
                <Grid container spacing={3} >
                    <Grid className="d-flex" item xs={12}>
                        <TextField
                            label="Header"
                            defaultValue={announcementInfo?.header}
                            variant="standard"
                            required
                            fullWidth
                            onChange={(event) => setHeader(event.target.value)}
                        />
                        <TextField 
                            label="Content"
                            defaultValue={announcementInfo?.content}
                            variant="standard"
                            required
                            multiline
                            fullWidth
                            onChange={(event) => setContent(event.target.value)}
                        />
                    </Grid>
                </Grid>
                <Box textAlign='center' sx={{pt: 6}}>
                    <Button onClick={onClose} variant="contained" sx={{ alignSelf: 'center' }} >Create</Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

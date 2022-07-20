import React, { useState, useEffect } from 'react';
import {
    styled, Button, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import SettingsService from '../../../services/SettingsService';

const _ = require("underscore")

export default function DayPicker(props) {
    const { convertIdxToDays, room, roomDictionary, setRoomDictionary } = props
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const [newDays, setNewDays] = useState(convertIdxToDays(roomDictionary[room]))
    
    const convertDaysToIdx = (daysArr) => {
        return daysArr.map((day) => daysOfWeek.indexOf(day))
    }

    const handleDayClick = (event, newArr) => {
        setNewDays(newArr)
        let newRoomDictionary = roomDictionary
        newRoomDictionary[room] = convertDaysToIdx(newArr)
        setRoomDictionary(newRoomDictionary)
        console.log(roomDictionary)
        SettingsService.updateLocations(
            JSON.stringify({
                room: room,
                days: newArr,
                daysOfWeek: daysOfWeek
            })
        )
        .then(res => {
            // TODO: add func to refresh, pass from home/askaquestion
            console.log(res)
        });
    }
    return (
        <ToggleButtonGroup
            value={newDays}
            onChange={handleDayClick}
            aria-label="text formatting"
            size='small'
        >
            {daysOfWeek.map((day) => (
                <ToggleButton value={day} key={day} aria-label={day} size='small' sx={{m: 0, p: 0}}>
                    <Button size='small' variant={roomDictionary[room].includes(day) ? 'contained' : 'outlined'} sx={{m: 0, pl: 0, pr: 0}} value={day}>{day.charAt(0)}</Button>
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    )
}
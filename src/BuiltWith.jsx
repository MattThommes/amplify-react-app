import React from 'react';
import HeartIcon from './images/heart.svg';
import './BuiltWith.scss';

function BuiltWith()
{
    return (
        <>
            <div className="built-with">
                Hand-crafted with <img src={HeartIcon} width="20" alt="love" /> by
                <a href="https://hypertextcraft.com" target="_blank" rel="noreferrer">HyperText Craft</a>
            </div>
        </>
    );
}

export default BuiltWith;

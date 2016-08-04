import app from './app';
import express from 'express';

app([
   express.static('../client')
]);

import {useSyncExternalStore} from 'react';
import {getQuestionSnapshot,subscribeQuestions} from './questions';

export function useQuestions(){return useSyncExternalStore(subscribeQuestions,getQuestionSnapshot,getQuestionSnapshot)}

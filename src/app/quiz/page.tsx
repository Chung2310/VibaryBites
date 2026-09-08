import { LazyFlavorQuiz } from './lazy-flavor-quiz';

export default function QuizPage() {
    return (
        <div className="bg-primary/20 py-12 sm:py-20">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <LazyFlavorQuiz />
            </div>
        </div>
    );
}

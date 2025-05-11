'use client';

import React from 'react';
import { BorderBeam } from '@/components/magicui/border-beam';
import Link from 'next/link';
import { Models } from 'appwrite';
import slugify from '@/utils/slugify';
import { avatars } from '@/models/client/config';
import convertDateToRelativeTime from '@/utils/relativeTime';

const QuestionCard = ({ question }: { question: Models.Document }) => {
    const [height, setHeight] = React.useState(0);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (ref.current) {
            setHeight(ref.current.clientHeight);
        }
    }, [ref]);

    return (
        <div
            ref={ref}
            className="relative flex flex-col gap-4 overflow-hidden rounded-xl border border-white/20 bg-white/5 p-4 duration-200 hover:bg-white/10 sm:flex-row"
        >
            <BorderBeam size={height} duration={12} delay={9} />
            <div className="relative shrink-0 text-sm sm:text-right">
                <p>{question.totalVotes} votes</p>
                <p>{question.totalAnswers} answers</p>
            </div>
            <div className="relative w-full">
                <Link
                    href={`/questions/${question.$id}/${slugify(question.title)}`}
                    className="text-orange-500 duration-200 hover:text-orange-600"
                >
                    <h2 className="text-xl">{question.title}</h2>
                </Link>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    {question.tags.map((tag: string) => (
                        <Link
                            key={tag}
                            href={`/questions?tag=${tag}`}
                            className="inline-block rounded-lg bg-white/10 px-2 py-0.5 duration-200 hover:bg-white/20"
                        >
                            #{tag}
                        </Link>
                    ))}
                    <div className="ml-auto flex items-center gap-1">
                        <picture>
                            <img
                                src={avatars.getInitials(
                                    question.author.name,
                                    24,
                                    24,
                                )}
                                alt={question.author.name}
                                className="rounded-lg"
                            />
                        </picture>
                        <Link
                            href={`/users/${question.author.$id}/${slugify(question.author.name)}`}
                            className="text-orange-500 hover:text-orange-600"
                        >
                            {question.author.name}
                        </Link>
                        <strong>
                            &quot;{question.author.reputation}&quot;
                        </strong>
                    </div>
                    <span>
                        asked{' '}
                        {convertDateToRelativeTime(
                            new Date(question.$createdAt),
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default QuestionCard;

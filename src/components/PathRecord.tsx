import React, { Fragment } from 'react';

const PathRecord = ({ path }: { path: string[] }) => {
    return (
        <div className="flex flex-wrap items-center justify-center max-w-[900px]">
            {path.map((item, index) => (
                <Fragment key={index}>
                    {index > 0 && (
                        <span className="font-[400] text-24 leading-28 text-linkle-foreground mx-2 flex-shrink-0">
                            →
                        </span>
                    )}
                    <span
                        className={`
              font-[400] text-24 leading-28 text-linkle-foreground
              ${index === 0 || index === path.length - 1 ? 'font-[600]' : ''}
              whitespace-nowrap
            `}
                        style={index === 0 || index === path.length - 1 ? { color: '#3366CC' } : {}}
                    >
                        {item}
                    </span>
                </Fragment>
            ))}
        </div>
    );
};

export default PathRecord;

export const PathResult = ({ path }: { path: string[] }) => {
    return (
        <div className="flex flex-wrap items-center justify-center max-w-xl px-4">
            {path.map((item, index) => (
                <Fragment key={index}>
                    {index > 0 && (
                        <span className="font-[400] text-24 leading-28 text-linkle-foreground mx-2 flex-shrink-0">
                            →
                        </span>
                    )}
                    <span
                        className={`
              font-[400] text-24 leading-28 text-linkle-foreground
              ${index === 0 || index === path.length - 1 ? 'font-[600]' : ''}
              whitespace-nowrap
            `}
                        style={index === 0 || index === path.length - 1 ? { color: '#3366CC' } : {}}
                    >
                        {item}
                    </span>
                </Fragment>
            ))}
        </div>
    );
};
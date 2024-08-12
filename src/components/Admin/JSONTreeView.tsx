import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

type JSONTreeProps = {
    data: any;
    level?: number;
};

const JSONTreeView: React.FC<JSONTreeProps> = ({ data, level = 0 }) => {
    const [isOpen, setIsOpen] = useState(level < 2);

    if (typeof data !== 'object' || data === null) {
        return <span className="text-green-600 break-all">{JSON.stringify(data)}</span>;
    }

    const toggleOpen = () => setIsOpen(!isOpen);

    const isArray = Array.isArray(data);
    const length = isArray ? data.length : Object.keys(data).length;

    return (
        <div className={`ml-${level * 4} overflow-hidden`}>
            <div
                onClick={toggleOpen}
                className="flex items-center cursor-pointer hover:bg-gray-100 py-1"
            >
                <span className="mr-1 flex-shrink-0">
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
                <span className="font-semibold text-blue-600 break-all">
                    {isArray ? 'Array' : 'Object'}
                </span>
                <span className="text-gray-500 ml-2 break-all">
                    {length} {length === 1 ? 'item' : 'items'}
                </span>
            </div>
            {isOpen && (
                <div className="border-l-2 border-gray-200 pl-4 mt-1">
                    {Object.entries(data).map(([key, value], index) => (
                        <div key={key} className="my-1 break-all">
                            <span className="font-medium text-purple-600">{isArray ? index : key}: </span>
                            <JSONTreeView data={value} level={level + 1} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JSONTreeView;
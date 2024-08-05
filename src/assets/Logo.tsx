import React from 'react';

const Logo = ({ width = 277, height = 49, color = "#3366CC" }) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 277 49"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ maxWidth: '100%', height: 'auto' }}
        >
            <path
                d="M0.0625 0.15625H9.96875V40.3125H38.375V49H0.0625V0.15625ZM46.75 0.15625H56.7188V49H46.75V0.15625ZM69.3125 0.15625H79.2188L109.656 16.0938V0.15625H119.562V49H109.656V26.5938L79.2188 10.75V49H69.3125V0.15625ZM133.375 0.15625H143.281V25.4375L169.062 0.15625H181.75L157.688 23.4688L181.75 49H168.562L150.562 30.375L143.281 37.4062V49H133.375V0.15625ZM186.625 0.15625H196.531V40.3125H224.938V49H205.781H186.625V0.15625ZM234.562 0.15625H276.156V8.84375H244.469V18.5938H272.531V26.75H244.469V40.3438H276.812V49H234.562V0.15625Z"
                fill={color}
            />
        </svg>
    );
};

export default Logo;
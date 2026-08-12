import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(
    props: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>,
) {
    return (
        <img
            {...props}
            src="/images/logo-wbk.png"
            alt="PAKDE"
        />
    );
}

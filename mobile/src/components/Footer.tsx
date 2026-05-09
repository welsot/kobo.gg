import { openUrl } from '@tauri-apps/plugin-opener';

export function Footer() {

    const handleOpen = async (url: string) => {
        await openUrl(url);
    };

    return (
        <footer className="footer">
            <div className="footer-content">
                <p>
                    &copy; {new Date().getFullYear()} kobo.gg &mdash; Developed by{' '}
                    <a
                        href="https://welsot.com"
                        className="footer-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleOpen('https://welsot.com')}
                    >
                        Welsot Solutions
                    </a>
                </p>
                <p className="footer-subtext">
                    Open source on{' '}
                    <a
                        href="https://github.com/welsot/kobo.gg"
                        className="footer-link-subtle"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleOpen('https://github.com/welsot/kobo.gg')}
                    >
                        GitHub
                    </a>
                    {' '}&middot;{' '}All rights reserved
                </p>
            </div>
        </footer>
    );
}

export default Footer;
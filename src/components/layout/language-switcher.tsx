
'use client';

import { useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

const LanguageSwitcher = () => {
    useEffect(() => {
        const addScript = document.createElement('script');
        addScript.setAttribute('src', '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit');
        document.body.appendChild(addScript);

        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement({
                pageLanguage: 'en',
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
            }, 'google_translate_element');
        };
    }, []);

    return (
        <div className="relative inline-block text-left">
            <div id="google_translate_element" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"></div>
            <Button variant="ghost" size="icon" aria-label="Choose language" className="relative z-0">
                <Globe className="h-5 w-5" />
            </Button>
        </div>
    );
};


declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: () => void;
    }
}

export default LanguageSwitcher;

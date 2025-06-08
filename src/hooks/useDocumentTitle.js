import { useEffect } from 'react';

const useDocumentTitle = (title) => {
    useEffect(() => {
        const baseTitle = "Tuyển sinh Đại học";
        document.title = title ? `${title} | ${baseTitle}` : baseTitle;
        
        // Cleanup function để reset về title mặc định khi component unmount
        return () => {
            document.title = baseTitle;
        };
    }, [title]);
};

export default useDocumentTitle; 
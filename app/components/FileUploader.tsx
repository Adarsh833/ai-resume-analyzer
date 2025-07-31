import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

const FileUploader = () => {
    const [file, setFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div className="w-full gradient-border">
            <div {...getRootProps()} className="space-y-4 cursor-pointer">
                <input {...getInputProps()} />

                <div className="mx-auto w-16 h-16 flex items-center justify-center">
                    <img src="/icons/info.svg" alt="upload" className="size-20" />
                </div>

                {file ? (
                    <div className="text-center">
                        <p className="text-green-600 text-lg font-semibold">File uploaded:</p>
                        <p className="text-gray-700">{file.name}</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-lg text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-lg text-gray-500">PDF (max 20 MB)</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUploader;

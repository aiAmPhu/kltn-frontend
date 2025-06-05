import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

const TinyMCEEditor = () => {
  return (
    <Editor
      apiKey='yn584rby174ogaewa0zij7yf1dwb178jk9dcq541j27ydmwk'
      init={{
        height: 500,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
          'emoticons', 'codesample', 'visualblocks', 'pagebreak', 'nonbreaking',
          'toc', 'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
          'preview', 'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | formatselect | ' +
          'bold italic backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help | image media | code | fullscreen',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        branding: false,
        promotion: false,
        valid_elements: '*[*]',
        extended_valid_elements: '*[*]',
        valid_children: '*[*]',
        allow_conditional_comments: true,
        allow_html_in_named_anchor: true,
        allow_unsafe_link_target: true,
        convert_urls: false,
        relative_urls: false,
        remove_script_host: false,
        document_base_url: 'https://kltn-frontend-five.vercel.app/',
        images_upload_url: 'https://kltn-frontend-five.vercel.app/upload',
        images_upload_handler: (blobInfo, success, failure) => {
          // Xử lý upload ảnh ở đây
          console.log('Upload image:', blobInfo);
          success('https://kltn-frontend-five.vercel.app/images/example.jpg');
        }
      }}
      initialValue="Welcome to TinyMCE!"
    />
  );
};

export default TinyMCEEditor; 
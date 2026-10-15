import type { INodeProperties } from 'n8n-workflow';

export const mediaTypeProperty: INodeProperties = {
  name: 'mediaType',
  displayName: 'Media Type',
  type: 'options',
  options: [
    {
      name: 'Image',
      value: 'image',
      description: 'png, jpeg, gif, webp or bmp (max. 5MB)',
    },
    {
      name: 'Audio',
      value: 'audio',
      description: 'mp3, wav, ogg, m4a, aac or flac (max. 16MB)',
    },
    {
      name: 'Video',
      value: 'video',
      description: 'mp4, avi, mov or webm (max. 16MB)',
    },
    {
      name: 'Document',
      value: 'document',
      description:
        'pdf, doc, docx, xls, xlsx, ppt, pptx, txt or rtf (max. 100MB)',
    },
  ],
  required: true,
  default: 'document',
};

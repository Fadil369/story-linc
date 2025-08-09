/**
 * Story export and sharing utilities
 * Provides multiple export formats and sharing capabilities for better market fit
 */

import { Story } from '../App';
import { logger } from './logger';

export type ExportFormat = 'txt' | 'markdown' | 'json' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  includePrompt?: boolean;
  fileName?: string;
}

export class StoryExporter {
  
  /**
   * Export a single story to the specified format
   */
  static async exportStory(story: Story, options: ExportOptions): Promise<void> {
    const { format, includeMetadata = true, includePrompt = true, fileName } = options;
    
    try {
      let content: string;
      let mimeType: string;
      let extension: string;
      
      switch (format) {
        case 'txt':
          content = this.toTextFormat(story, includeMetadata, includePrompt);
          mimeType = 'text/plain';
          extension = 'txt';
          break;
        
        case 'markdown':
          content = this.toMarkdownFormat(story, includeMetadata, includePrompt);
          mimeType = 'text/markdown';
          extension = 'md';
          break;
        
        case 'json':
          content = this.toJSONFormat(story, includeMetadata);
          mimeType = 'application/json';
          extension = 'json';
          break;
        
        case 'pdf':
          // For PDF, we'll create HTML and let the browser handle printing
          content = this.toPDFFormat(story, includeMetadata, includePrompt);
          this.printAsPDF(content, fileName);
          return;
        
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
      
      const defaultFileName = fileName || this.generateFileName(story, extension);
      this.downloadFile(content, defaultFileName, mimeType);
      
      logger.userAction('Export Story', {
        storyId: story.id,
        format,
        includeMetadata,
        includePrompt,
        fileName: defaultFileName
      });
      
    } catch (error) {
      logger.storyError('Export Story', error as Error, { storyId: story.id, format });
      throw error;
    }
  }
  
  /**
   * Export multiple stories as a collection
   */
  static async exportStories(stories: Story[], options: ExportOptions & { collectionName?: string }): Promise<void> {
    const { format, collectionName = 'story-collection' } = options;
    
    try {
      let content: string;
      let mimeType: string;
      let extension: string;
      
      switch (format) {
        case 'txt':
          content = stories.map(story => this.toTextFormat(story, true, true)).join('\n\n' + '='.repeat(50) + '\n\n');
          mimeType = 'text/plain';
          extension = 'txt';
          break;
        
        case 'markdown':
          content = this.toMarkdownCollection(stories, collectionName);
          mimeType = 'text/markdown';
          extension = 'md';
          break;
        
        case 'json':
          content = JSON.stringify({
            collection: collectionName,
            exportedAt: new Date().toISOString(),
            stories: stories.map(story => this.storyToObject(story, true))
          }, null, 2);
          mimeType = 'application/json';
          extension = 'json';
          break;
        
        default:
          throw new Error(`Batch export not supported for format: ${format}`);
      }
      
      const fileName = `${collectionName}.${extension}`;
      this.downloadFile(content, fileName, mimeType);
      
      logger.userAction('Export Story Collection', {
        storyCount: stories.length,
        format,
        collectionName
      });
      
    } catch (error) {
      logger.storyError('Export Story Collection', error as Error, { storyCount: stories.length, format });
      throw error;
    }
  }
  
  /**
   * Share story via Web Share API or fallback to clipboard
   */
  static async shareStory(story: Story, format: 'text' | 'url' = 'text'): Promise<void> {
    try {
      if (format === 'text') {
        const shareText = this.toShareFormat(story);
        
        if (navigator.share) {
          await navigator.share({
            title: story.title,
            text: shareText,
          });
        } else {
          await navigator.clipboard.writeText(shareText);
          // Show toast notification that text was copied
          if ('dispatchEvent' in window) {
            window.dispatchEvent(new CustomEvent('story-copied', { detail: { story } }));
          }
        }
      }
      
      logger.userAction('Share Story', {
        storyId: story.id,
        format,
        method: navigator.share ? 'native' : 'clipboard'
      });
      
    } catch (error) {
      logger.storyError('Share Story', error as Error, { storyId: story.id, format });
      throw error;
    }
  }
  
  // Private formatting methods
  
  private static toTextFormat(story: Story, includeMetadata: boolean, includePrompt: boolean): string {
    let content = '';
    
    if (includeMetadata) {
      content += `Title: ${story.title}\n`;
      content += `Language: ${story.language === 'ar' ? 'Arabic' : 'English'}\n`;
      content += `Created: ${new Date(story.createdAt).toLocaleDateString()}\n`;
      if (story.themes.length > 0) {
        content += `Themes: ${story.themes.join(', ')}\n`;
      }
      content += '\n';
    }
    
    if (includePrompt) {
      content += `Prompt: ${story.prompt}\n\n`;
    }
    
    content += story.content;
    
    return content;
  }
  
  private static toMarkdownFormat(story: Story, includeMetadata: boolean, includePrompt: boolean): string {
    let content = `# ${story.title}\n\n`;
    
    if (includeMetadata) {
      content += `**Language:** ${story.language === 'ar' ? 'Arabic العربية' : 'English'}\n`;
      content += `**Created:** ${new Date(story.createdAt).toLocaleDateString()}\n`;
      if (story.themes.length > 0) {
        content += `**Themes:** ${story.themes.join(', ')}\n`;
      }
      content += '\n';
    }
    
    if (includePrompt) {
      content += `## Story Prompt\n\n> ${story.prompt}\n\n`;
    }
    
    content += `## Story\n\n${story.content}\n\n`;
    content += `*Generated by Story Weaver*`;
    
    return content;
  }
  
  private static toJSONFormat(story: Story, includeMetadata: boolean): string {
    return JSON.stringify(this.storyToObject(story, includeMetadata), null, 2);
  }
  
  private static toPDFFormat(story: Story, includeMetadata: boolean, includePrompt: boolean): string {
    const isRTL = story.language === 'ar';
    
    return `
    <!DOCTYPE html>
    <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${story.language}">
    <head>
      <meta charset="UTF-8">
      <title>${story.title}</title>
      <style>
        body {
          font-family: ${isRTL ? 'Tahoma, Arial' : 'Georgia, serif'};
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        .header {
          border-bottom: 2px solid #8B5CF6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .title {
          font-size: 2.5em;
          margin: 0;
          color: #8B5CF6;
        }
        .metadata {
          color: #666;
          margin: 10px 0;
        }
        .prompt {
          background: #f5f5f5;
          padding: 15px;
          border-left: 4px solid #8B5CF6;
          margin: 20px 0;
          font-style: italic;
        }
        .content {
          font-size: 1.1em;
          line-height: 1.8;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #666;
          font-size: 0.9em;
        }
        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">${story.title}</h1>
        ${includeMetadata ? `
          <div class="metadata">
            <strong>${isRTL ? 'اللغة:' : 'Language:'}</strong> ${story.language === 'ar' ? 'Arabic العربية' : 'English'}<br>
            <strong>${isRTL ? 'تاريخ الإنشاء:' : 'Created:'}</strong> ${new Date(story.createdAt).toLocaleDateString()}<br>
            ${story.themes.length > 0 ? `<strong>${isRTL ? 'المواضيع:' : 'Themes:'}</strong> ${story.themes.join(', ')}` : ''}
          </div>
        ` : ''}
      </div>
      
      ${includePrompt ? `
        <div class="prompt">
          <strong>${isRTL ? 'فكرة القصة:' : 'Story Prompt:'}</strong><br>
          ${story.prompt}
        </div>
      ` : ''}
      
      <div class="content">
        ${story.content.replace(/\n/g, '<br>')}
      </div>
      
      <div class="footer">
        <em>${isRTL ? 'تم إنشاؤها بواسطة Story Weaver' : 'Generated by Story Weaver'}</em>
      </div>
    </body>
    </html>
    `;
  }
  
  private static toMarkdownCollection(stories: Story[], collectionName: string): string {
    let content = `# ${collectionName}\n\n`;
    content += `*Collection of ${stories.length} stories*\n\n`;
    content += `---\n\n`;
    
    stories.forEach((story, index) => {
      content += `## ${index + 1}. ${story.title}\n\n`;
      content += `**Language:** ${story.language === 'ar' ? 'Arabic العربية' : 'English'}\n`;
      content += `**Created:** ${new Date(story.createdAt).toLocaleDateString()}\n\n`;
      content += `### Prompt\n> ${story.prompt}\n\n`;
      content += `### Story\n${story.content}\n\n`;
      content += `---\n\n`;
    });
    
    content += `*Exported from Story Weaver on ${new Date().toLocaleDateString()}*`;
    
    return content;
  }
  
  private static toShareFormat(story: Story): string {
    const isArabic = story.language === 'ar';
    return `${story.title}\n\n${story.content}\n\n${isArabic ? '✨ تم إنشاؤها بواسطة Story Weaver' : '✨ Created with Story Weaver'}`;
  }
  
  private static storyToObject(story: Story, includeMetadata: boolean) {
    const base = {
      title: story.title,
      content: story.content,
      prompt: story.prompt,
      language: story.language
    };
    
    if (includeMetadata) {
      return {
        ...base,
        id: story.id,
        createdAt: story.createdAt,
        themes: story.themes,
        characters: story.characters,
        collectionId: story.collectionId,
        categoryId: story.categoryId
      };
    }
    
    return base;
  }
  
  private static generateFileName(story: Story, extension: string): string {
    const sanitizedTitle = story.title
      .replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50);
    
    const date = new Date(story.createdAt).toISOString().split('T')[0];
    return `${sanitizedTitle}-${date}.${extension}`;
  }
  
  private static downloadFile(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  private static printAsPDF(htmlContent: string, fileName?: string): void {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  }
}
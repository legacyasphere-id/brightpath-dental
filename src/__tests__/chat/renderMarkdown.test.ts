import { describe, it, expect } from 'vitest';
import { isValidElement, type ReactNode } from 'react';
import { renderMarkdown } from '@/components/chat/ChatMessage';

// Flattens a React node tree to plain text, so assertions don't need to
// know the exact element/child shape — just what a reader would see.
function textOf(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return textOf(node.props.children);
  }
  return '';
}

describe('renderMarkdown', () => {
  it('renders plain text with no markdown as a single paragraph', () => {
    const blocks = renderMarkdown('Hello world');
    expect(blocks).toHaveLength(1);
    expect(isValidElement(blocks[0]) && blocks[0].type).toBe('p');
    expect(textOf(blocks[0])).toBe('Hello world');
  });

  it('splits on blank lines into separate paragraphs', () => {
    const blocks = renderMarkdown('Para one.\n\nPara two.');
    expect(blocks).toHaveLength(2);
    expect(textOf(blocks[0])).toBe('Para one.');
    expect(textOf(blocks[1])).toBe('Para two.');
  });

  it('joins soft-wrapped lines within a paragraph with a space, not nothing', () => {
    const blocks = renderMarkdown('Minggu: 09.00-14.00 WIB\nKami tutup pada hari libur.');
    expect(blocks).toHaveLength(1);
    expect(textOf(blocks[0])).toBe(
      'Minggu: 09.00-14.00 WIB Kami tutup pada hari libur.',
    );
  });

  it('renders "- " bullet lines as a real list, not inline dashes', () => {
    const blocks = renderMarkdown(
      'Jam operasional:\n- Senin - Jumat: 08.00-20.00\n- Sabtu: 08.00-17.00',
    );
    expect(blocks).toHaveLength(2);
    expect(isValidElement(blocks[0]) && blocks[0].type).toBe('p');

    const list = blocks[1];
    expect(isValidElement(list) && list.type).toBe('ul');
    if (isValidElement<{ children: ReactNode[] }>(list)) {
      expect(list.props.children).toHaveLength(2);
      expect(textOf(list.props.children[0])).toBe('Senin - Jumat: 08.00-20.00');
      expect(textOf(list.props.children[1])).toBe('Sabtu: 08.00-17.00');
    }
  });

  it('renders numbered list markers as list items too', () => {
    const blocks = renderMarkdown('1. First service\n2. Second service');
    expect(blocks).toHaveLength(1);
    expect(isValidElement(blocks[0]) && blocks[0].type).toBe('ul');
  });

  it('renders **bold** as a <strong> element, not literal asterisks', () => {
    const blocks = renderMarkdown('Ini **penting** sekali');
    expect(textOf(blocks[0])).toBe('Ini penting sekali');

    const paragraph = blocks[0];
    if (isValidElement<{ children: ReactNode[] }>(paragraph)) {
      const strongChild = paragraph.props.children.find(
        (child) => isValidElement(child) && child.type === 'strong',
      );
      expect(strongChild).toBeDefined();
      expect(textOf(strongChild)).toBe('penting');
    }
  });

  it('returns no blocks for empty content', () => {
    expect(renderMarkdown('')).toHaveLength(0);
  });
});

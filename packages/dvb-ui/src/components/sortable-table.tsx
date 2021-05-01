import { TriangleUpIcon, TriangleDownIcon } from '@chakra-ui/icons';
import { Table, Tbody, Th, Td, Thead, Tr, ButtonGroup, Button } from '@chakra-ui/react';
import React, { useEffect, useMemo, useState } from 'react';
import { get, find } from 'lodash';
import LoadingTr from './loading-tr';

export type SortableTableHeader<T> = {
  title: string;
  align?: 'left' | 'right';
  reverse?: boolean;
  filterable?: boolean;
} & ({
  path: string;
  render?: (item: T) => any;
} | {
  path?: string;
  render: (item: T) => any;
});

function doFilter(item: any, filter: string | undefined, headers: SortableTableHeader<any>[]) {
  if (!filter) {
    return true;
  }
  for (const header of headers) {
    if (header.filterable === true) {
      const value = get(item, header.path);
      if (typeof value === 'string') {
        if (value.includes(filter)) {
          return true;
        }
      }
    }
  }
  return false;
}

export default function SortableTable<T>({ headers, data, isLoading, initialPath, filter }: { headers: SortableTableHeader<T>[], data: T[], isLoading?: boolean, initialPath: string, filter?: string }) {
  const itemsPerPage = 50;
  const [ sort, setSort ] = useState({ path: initialPath, ascending: true, reverse: find(headers, { path: initialPath })?.reverse === true, page: 0 });

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(data.filter(item => doFilter(item, filter, headers)).length / itemsPerPage));
  }, [ data, filter ]);

  const sortedData = useMemo(() => {
    const arr = data.filter(item => doFilter(item, filter, headers));
    if (sort.path !== '') {
      arr.sort((a, b) => {
        const n = (sort.ascending ? -1 : 1) * (sort.reverse ? -1 : 1);
        return get(a, sort.path) < get(b, sort.path) ? (1 * n) : (-1 * n);
      });
    }
    return arr.slice(itemsPerPage * sort.page, itemsPerPage * sort.page + itemsPerPage);
  }, [ data, sort, filter ]);

  useEffect(() => {
    if (sort.page >= pageCount) {
      setSort(value => ({ ...value, page: pageCount - 1}));
    }
  }, [ pageCount ]);

  return (
    <>
      <Table variant="striped" size="sm">
        <Thead>
          <Tr userSelect="none">
            { headers.map(header => (
              <Th key={ header.title } cursor={ !!header.path ? 'pointer' : 'default' } onClick={ header.path ? () => {
                if (header.path === sort.path) {
                  setSort(value => ({ ...value, ascending: !value.ascending }));
                } else {
                  setSort(value => ({ ...value, path: header.path, reverse: header.reverse === true, ascending: true }));
                }
               } : () => {} }>
                {
                  header.path === sort.path ? (
                  <>{ header.title } { sort.ascending ? <TriangleUpIcon /> : <TriangleDownIcon /> }</>
                  ) : (
                    <>{ header.title }</>
                  )
                }
              </Th>
            )) }
          </Tr>
        </Thead>
        <Tbody>
          { !isLoading ? sortedData.map((item, i) => (
            <Tr key={ i }>
              { headers.map(header => (
                <Td key={ header.title } textAlign={ header.align || 'left' }>
                  { header.render ? header.render(item) : get(item, header.path) }
                </Td>
              )) }
            </Tr>
          )) : null }
          { isLoading ? <LoadingTr colSpan={ headers.length } /> : null }
        </Tbody>
      </Table>
      { pageCount > 1 ? 
        <ButtonGroup isAttached={ true } variant="outline" mt={ 2 }>
          <Button disabled={ sort.page === 0 } onClick={ () => setSort(value => ({ ...value, page: value.page - 1 })) }>Previous</Button>
          { Array.from(Array(pageCount)).map((_, i) => (
            <Button key={ i } onClick={ () => setSort(value => ({ ...value, page: i })) } variant={ sort.page === i ? 'solid' : 'outline' }>{ i + 1 }</Button>
          )) }
          <Button disabled={ sort.page === pageCount - 1 } onClick={ () => setSort(value => ({ ...value, page: value.page + 1 })) }>Next</Button>
        </ButtonGroup>
      : null }
    </>
  )
}
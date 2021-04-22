import { Tr, Td, Skeleton } from "@chakra-ui/react";
import { useMemo } from "react";

export default function LoadingTr({ count = 4, colSpan }: { count?: number, colSpan: number }) {
  const arr = useMemo(() => {
    const arr = [];
    arr.length = count;
    arr.fill(0, 0, count);
    return arr;
  }, [ count ]);
  return (
    <>
      { arr.map((_, index) => (
        <Tr key={ index }>
          <Td colSpan={ colSpan }><Skeleton height="20px" /></Td>
        </Tr>
      )) }
    </>
  )
}
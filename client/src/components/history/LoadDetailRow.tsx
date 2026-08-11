import type { ConfirmedLoad } from "../../types/estimator";
import LoadDetailCard from "./LoadDetailCard";

interface LoadDetailRowProps {
  load: ConfirmedLoad;
  colSpan: number;
}

export default function LoadDetailRow({ load, colSpan }: LoadDetailRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="border-b border-gray-100 bg-gray-50 px-4 py-4">
        <LoadDetailCard load={load} />
      </td>
    </tr>
  );
}

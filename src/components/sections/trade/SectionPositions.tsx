import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { FaEdit } from "react-icons/fa";
import SheetPlaceClose from "@/components/sheet/place_close";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { toast } from "react-toastify";

export interface Position {
  id: string;
  size: string;
  market: string;
  icon: string;
  mark: string;
  entryPrice: string;
  pnl: string;
  amount: string;
  type: string;
  estLiq: string;
  entryTime: string;
}

interface SectionPositionsProps {
  positions?: Position[];
  currentActiveRowPositions: { [key: string]: boolean };
  toggleActiveRow: (label: string) => void;
  hideRow: (label: string) => void;
}

function SectionPositions({
  positions,
  currentActiveRowPositions,
  toggleActiveRow,
  hideRow,
}: SectionPositionsProps) {
  if (!positions || !Array.isArray(positions)) {
    // Handle the case when positions is undefined or not an array
    return null;
  }

  const handleToggleActiveRow = (positionId: string) => {
    const isActive = currentActiveRowPositions[positionId];

    Object.keys(currentActiveRowPositions).forEach((key) => {
      if (currentActiveRowPositions[key]) {
        toggleActiveRow(key);
      }
    });

    if (!isActive) {
      toggleActiveRow(positionId);
    }
  };

  const handleHideRow = (positionId: string) => {
    hideRow(positionId);
    toast.success("Position closed successfully");
  };

  return (
    <Table className="whitespace-nowrap">
      <TableHeader>
        <TableRow className="hover:bg-background border-none">
          <TableHead className="pr-0"></TableHead>
          <TableHead>
            <p className="text-card-foreground">Size / Market</p>
          </TableHead>
          <TableHead>
            <p className="text-card-foreground">Mark / Entry Price</p>
          </TableHead>
          <TableHead className="text-right">
            <p className="text-card-foreground">Pnl. Amount</p>
            <p>(USD)</p>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {positions.map((position, index) => (
          <Fragment key={position.id}>
            {index !== 0 && (
              <TableRow
                key={`separator-${position.id}`}
                className="border-none"
              >
                <TableCell className="py-2"></TableCell>
              </TableRow>
            )}
            <TableRow
              onClick={() => handleToggleActiveRow(position.id)}
              key={`row-${position.id}`}
              className="bg-card hover:bg-card border-none cursor-pointer"
            >
              <TableCell className="pl-3 pr-0 w-[45px]">
                <div>
                  <Image
                    src={position.icon}
                    alt={position.market}
                    width={30}
                    height={30}
                  />
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p
                    className={`${
                      Number(position.size) >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {position.size}
                  </p>
                  <p className="text-card-foreground">{position.market}</p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p>{position.mark}</p>
                  <p className="text-card-foreground">
                    {position.entryPrice} USD
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div>
                  <p
                    className={`${
                      Number(position.pnl) >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {position.pnl}
                  </p>
                  <p className="text-card-foreground">{position.amount}</p>
                </div>
              </TableCell>
            </TableRow>
            {currentActiveRowPositions[position.id] && (
              <>
                <TableRow
                  key={`details-${position.id}`}
                  className="bg-card hover:bg-card border-none"
                >
                  <TableCell colSpan={4} className="py-1">
                    <div className="w-full flex justify-between">
                      <div className="w-full">
                        <p className="text-card-foreground">Type</p>
                        <p className="font-medium">{position.type}</p>
                      </div>
                      <div className="text-right w-full">
                        <p className="text-card-foreground">Est. Liq</p>
                        <p className="font-medium">{position.estLiq}</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow
                  key={`actions-${position.id}`}
                  className="bg-card hover:bg-card border-none"
                >
                  <TableCell colSpan={4}>
                    <div className="w-full flex justify-center space-x-3">
                      <Drawer>
                        <DrawerTrigger>
                          <Button
                            variant="secondary"
                            className="flex space-x-2"
                          >
                            <FaEdit />
                            <span>TP/SL</span>
                          </Button>
                        </DrawerTrigger>
                        <SheetPlaceClose />
                      </Drawer>
                      <Button
                        onClick={() => handleHideRow(position.id)}
                        variant="destructive"
                      >
                        <span>Close Market</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </>
            )}
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
}

export default SectionPositions;

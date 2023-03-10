import { HttpException } from '@nestjs/common';
import { Position } from '@adapterOut/wallet/position';
import { PositionDTO, WalletDTO } from 'domain/dto';

export const getPositionsCurrentValues = (
  bdrs: { latestPrice: number; symbol: string }[],
): any => {
  return bdrs.reduce(
    (
      accumulate,
      { latestPrice, symbol }: { latestPrice: number; symbol: string },
    ) => {
      accumulate[symbol] = latestPrice;

      return accumulate;
    },
    {},
  );
};

export const positionsModelToEntityList = (
  positionsModel: Position[],
  positionsCurrentValues: any,
) =>
  positionsModel.map(({ symbol, amount }) => {
    const currentPrice = positionsCurrentValues[symbol];

    return new PositionDTO(symbol, amount, currentPrice);
  });

export const validateOrder = (
  bdr: any,
  amount: number,
  checkingAccountAmount: number,
) => {
  if (!bdr) {
    throw new HttpException('BDR não encontrado', 404);
  }

  const price = bdr.latestPrice * amount;

  if (checkingAccountAmount - price < 0) {
    throw new HttpException('Não há saldo disponível', 400);
  }
};
const addPosition = (newPosition: PositionDTO, accountPosition: WalletDTO) => {
  const exist = accountPosition.positions.some(
    position => position.symbol === newPosition.symbol,
  );

  let updatedPositions: PositionDTO[];

  if (exist) {
    updatedPositions = accountPosition.positions.map(position => {
      if (position.symbol === newPosition.symbol) {
        position.amount += newPosition.amount;
      }
      return position;
    });
  } else {
    updatedPositions = accountPosition.positions.concat([newPosition]);
  }

  return new WalletDTO(accountPosition.checkingAccountAmount, updatedPositions);
};
export const addOrder = (
  newPosition: PositionDTO,
  accountPosition: WalletDTO,
) => {
  const price = newPosition.currentPrice * newPosition.amount;

  const newAccountPosition = new WalletDTO(
    accountPosition.checkingAccountAmount - price,
    accountPosition.positions,
  );

  return addPosition(newPosition, newAccountPosition);
};

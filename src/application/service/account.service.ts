import {
  getPositionsCurrentValues,
  positionsModelToEntityList,
} from '@application/helper';
import { IAccountService } from '@application/in';
import { IAccountRepository } from '@application/out';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { UserPositionEntity } from 'domain/entities';
import { Providers } from 'domain/enums';

@Injectable()
export class AccountService implements IAccountService {
  private readonly logger = new Logger('AccountService');
  constructor(
    @Inject(Providers.I_ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
  ) {}
  async getAccountPositions(id: string): Promise<UserPositionEntity> {
    this.logger.log(`getAccountPositions ${id}`);

    const accountPosition = await this.accountRepository.getAccountPositions(
      id,
    );

    const positionsCurrentValues = await getPositionsCurrentValues(
      accountPosition.positions.map(({ symbol }) => symbol),
    );

    return new UserPositionEntity(
      accountPosition.checkingAccountAmount,
      positionsModelToEntityList(
        accountPosition.positions,
        positionsCurrentValues,
      ),
    );
  }
}
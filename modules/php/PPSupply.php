<?php

trait PPSupplyTrait
{

  public function createSupply()
  {
    $this->tokens->createTokensPack("rupee_{INDEX}", RUPEE_SUPPLY, 36);
    $this->tokens->createTokensPack("block_afghan_{INDEX}", BLOCKS_AFGHAN_SUPPLY, 12);
    $this->tokens->createTokensPack("block_british_{INDEX}", BLOCKS_BRITISH_SUPPLY, 12);
    $this->tokens->createTokensPack("block_russian_{INDEX}", BLOCKS_RUSSIAN_SUPPLY, 12);
  }
}
